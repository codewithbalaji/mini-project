import Department from "../models/Department.js";

import User from "../models/User.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      organizationId: req.user.organizationId,
    }).sort({ createdAt: -1 });

    // Get user counts for each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const userCount = await User.countDocuments({
          organizationId: req.user.organizationId,
          departmentId: dept._id
        });
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
      organizationId: req.user.organizationId
    });

    res.json({ ...department.toObject(), userCount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { name: req.body.name },
      { new: true }
    );
    if (!department) return res.status(404).json({ message: "Department not found" });
    
    // get user count
    const userCount = await User.countDocuments({ departmentId: department._id });
    
    res.json({ ...department.toObject(), userCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};