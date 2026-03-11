import Department from "../models/Department.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      organizationId: req.user.organizationId,
    }).sort({ createdAt: -1 });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  const department = await Department.create({
    name: req.body.name,
    organizationId: req.user.organizationId
  });

  res.json(department);
};