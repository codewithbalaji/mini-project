import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      departmentId: user.departmentId  // needed for dept-scoped queries
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default generateToken;