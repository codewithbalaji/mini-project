import Department from "../models/Department.js";

export const createDepartment = async (req, res) => {
  const department = await Department.create({
    name: req.body.name,
    organizationId: req.user.organizationId
  });

  res.json(department);
};