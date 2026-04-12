import User from "../models/User.js";

// Get users in the organization
// - ADMIN: returns all users, optionally filtered by ?departmentId
// - MANAGER: prefers their own departmentId; if not set, uses ?departmentId param;
//            if neither is set, returns all org users
export const getUsers = async (req, res) => {
  try {
    const { departmentId: queryDeptId } = req.query;
    const query = { organizationId: req.user.organizationId };

    if (req.user.role === "MANAGER") {
      // Use manager's own department first; fall back to the dept supplied in the query
      // (e.g. the project's dept), then fall back to all org users
      const effectiveDeptId = req.user.departmentId || queryDeptId;
      if (effectiveDeptId) {
        query.departmentId = effectiveDeptId;
      }
      // If still no dept, no restriction — manager sees all org users
    } else if (queryDeptId) {
      // Admin filtering by a specific department
      query.departmentId = queryDeptId;
    }

    const users = await User.find(query)
      .select("-password")
      .populate("departmentId", "name");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user department (Admin or Manager)
export const updateUserDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;
    
    // If manager, verify they manage the target department
    if (req.user.role === "MANAGER" && departmentId) {
      const Department = (await import("../models/Department.js")).default;
      const department = await Department.findOne({
        _id: departmentId,
        organizationId: req.user.organizationId,
        managerId: req.user.id // JWT uses 'id' not '_id'
      });
      
      if (!department) {
        return res.status(403).json({ message: "You can only assign users to departments you manage" });
      }
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent assigning a manager as a member of their own managed department
    if (departmentId) {
      const Department = (await import("../models/Department.js")).default;
      const department = await Department.findOne({
        _id: departmentId,
        managerId: user._id
      });
      
      if (department) {
        return res.status(400).json({ 
          message: "Cannot assign a manager as a member of a department they manage" 
        });
      }
    }
    
    user.departmentId = departmentId;
    await user.save();
    await user.populate("departmentId", "name");
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deactivate user account (Admin only)
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.json({ message: "User deactivated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};