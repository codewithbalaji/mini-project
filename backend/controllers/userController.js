import User from "../models/User.js";

// Get all users in the organization (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      organizationId: req.user.organizationId
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
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
    res.status(500).json({
      message: error.message
    });
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

    res.json({
      message: "User deactivated",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};