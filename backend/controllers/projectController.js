import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import notificationService from "../services/notificationService.js";
import statsService from "../services/statsService.js";

// POST /api/projects — ADMIN, MANAGER
export const createProject = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, dueDate, budget, clientName, tags, members } = req.body;
    let { departmentId, managerId: bodyManagerId } = req.body;
    const { id: createdBy, organizationId, name: creatorName, role } = req.user;

    // If MANAGER is creating the project:
    //   - managerId is always the logged-in user
    //   - departmentId is always the manager's own department (enforced server-side)
    let managerId = bodyManagerId;
    if (role === "MANAGER") {
      managerId = createdBy;
      // Pull the manager's department from their user record
      const managerUser = await User.findById(createdBy).select("departmentId");
      departmentId = managerUser?.departmentId || undefined;
    }

    const project = new Project({
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      budget,
      clientName,
      departmentId, // from manager's profile OR admin's form input
      tags,
      members: members || [],
      managerId,
      organizationId,
      createdBy
    });

    await project.save();

    // Populate for response
    await project.populate([
      { path: "managerId", select: "name email" },
      { path: "departmentId", select: "name" },
      { path: "members", select: "name email role" },
    ]);

    // Notify members added at creation
    if (members && members.length > 0) {
      await notificationService.notifyProjectCreated({
        memberIds: members,
        projectTitle: title,
        projectId: project._id,
        organizationId,
        creatorName
      });
    }

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// GET /api/projects — all roles (org-scoped, role-filtered)
export const getProjects = async (req, res) => {
  try {
    const { organizationId, id: userId, role } = req.user;
    const { status, priority, departmentId } = req.query;

    const filter = { organizationId };

    // Employees only see projects they are members of
    if (role === "EMPLOYEE") {
      filter.members = userId;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (departmentId) filter.departmentId = departmentId;

    const projects = await Project.find(filter)
      .populate("managerId", "name email")
      .populate("departmentId", "name")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/projects/:id — members, managers, admin, viewer
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
      .populate("managerId", "name email")
      .populate("departmentId", "name")
      .populate("members", "name email role")
      .populate("createdBy", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    // EMPLOYEE can only view projects they belong to
    if (req.user.role === "EMPLOYEE") {
      const isMember = project.members.some((m) => m._id.toString() === req.user.id);
      if (!isMember) return res.status(403).json({ message: "Access denied" });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/projects/:id — ADMIN, MANAGER
export const updateProject = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, dueDate, budget, clientName, departmentId, tags } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { title, description, status, priority, startDate, dueDate, budget, clientName, departmentId, tags },
      { new: true, runValidators: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project updated", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/projects/:id — ADMIN only
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Also delete all tasks belonging to this project
    await Task.deleteMany({ projectId: req.params.id });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/projects/:id/members — Add member
export const addProjectMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { $addToSet: { members: userId } },
      { new: true }
    )
      .populate("managerId", "name email")
      .populate("departmentId", "name")
      .populate("members", "name email role");

    if (!project) return res.status(404).json({ message: "Project not found" });

    await notificationService.notifyProjectCreated({
      memberIds: [userId],
      projectTitle: project.title,
      projectId: project._id,
      organizationId: req.user.organizationId,
      creatorName: req.user.name
    });

    res.json({ message: "Member added", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// DELETE /api/projects/:id/members/:userId — Remove member
export const removeProjectMember = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { $pull: { members: req.params.userId } },
      { new: true }
    )
      .populate("managerId", "name email")
      .populate("departmentId", "name")
      .populate("members", "name email role");


    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Member removed", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/projects/:id/stats — project metrics
export const getProjectStats = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    const stats = await statsService.getProjectStats(req.params.id);

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
