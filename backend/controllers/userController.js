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

// Update user department (Admin only)
export const updateUserDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { departmentId },
      { new: true }
    ).populate("departmentId", "name");
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