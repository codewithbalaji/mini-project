import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import generateToken from "../utils/generateToken.js";
import { ROLES } from "../constants/roles.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = await Organization.create({
      name: organizationName
    });

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ROLES.ADMIN,
      organizationId: organization._id
    });

    const token = generateToken(user);

    res.json({
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = generateToken(user);

    res.json({
      user,
      token
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};