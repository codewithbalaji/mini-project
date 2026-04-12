import Department from "../models/Department.js";

import User from "../models/User.js";

export const getDepartments = async (req, res) => {
  try {
    // Build query based on role
    const query = { organizationId: req.user.organizationId };
    
    // Managers only see departments they manage
    if (req.user.role === "MANAGER") {
      query.managerId = req.user.id; // JWT uses 'id' not '_id'
    }
    // Admins see all departments

    const departments = await Department.find(query)
      .populate("managerId", "name email")
      .sort({ createdAt: -1 });

    // Get user counts for each department (excluding the manager)
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const query = {
          organizationId: req.user.organizationId,
          departmentId: dept._id
        };
        
        // Exclude the manager from the count
        if (dept.managerId) {
          query._id = { $ne: dept.managerId };
        }
        
        const userCount = await User.countDocuments(query);
        return {
          ...dept.toObject(),
          userCount
        };
      })
    );

    res.json(departmentsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const department = await Department.create({
      name: req.body.name,
      managerId: req.body.managerId || null,
      organizationId: req.user.organizationId
    });

    const populated = await Department.findById(department._id).populate("managerId", "name email");

    res.json({ ...populated.toObject(), userCount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const updateData = { name: req.body.name };
    
    // Only allow managerId update if provided
    if (req.body.managerId !== undefined) {
      updateData.managerId = req.body.managerId || null;
    }

    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      updateData,
      { new: true }
    ).populate("managerId", "name email");
    
    if (!department) return res.status(404).json({ message: "Department not found" });
    
    // get user count (excluding the manager)
    const query = { departmentId: department._id };
    if (department.managerId) {
      query._id = { $ne: department.managerId };
    }
    const userCount = await User.countDocuments(query);
    
    res.json({ ...department.toObject(), userCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDepartmentMembers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if department exists and user has access
    const department = await Department.findOne({
      _id: id,
      organizationId: req.user.organizationId
    });
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    // Managers can only view members of departments they manage
    if (req.user.role === "MANAGER") {
      const managerIdStr = department.managerId?.toString();
      const userIdStr = req.user.id; // JWT uses 'id' not '_id'
      if (managerIdStr !== userIdStr) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    // Get members excluding the manager
    const query = {
      organizationId: req.user.organizationId,
      departmentId: id
    };
    
    // Exclude the manager from the members list
    if (department.managerId) {
      query._id = { $ne: department.managerId };
    }
    
    const members = await User.find(query).select("-password").sort({ name: 1 });
    
    res.json(members);
  } catch (error) {
    console.error("Error in getDepartmentMembers:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};