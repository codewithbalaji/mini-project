import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import Organization from "../models/Organization.js";
import inviteTemplate from "../mail/templates/inviteTemplate.js";
import { sendEmail } from "../mail/sendEmail.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";

export const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      organizationId: req.user.organizationId,
    }).sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const inviteUser = async (req, res) => {
  try {

    const { email, role, departmentId } = req.body;

    const token = crypto.randomBytes(32).toString("hex");

    console.log("Generated invite token:", token);

    const invitation = await Invitation.create({
      email,
      role,
      departmentId,
      organizationId: req.user.organizationId,
      invitedBy: req.user.id,
      token,
      status: "PENDING",
      expiresAt: Date.now() + 1000 * 60 * 60 * 48
    });

    console.log("Invitation saved:", invitation);

    const organization = await Organization.findById(req.user.organizationId);

    const inviteLink =
      `${process.env.FRONTEND_URL}/accept-invite/${token}`;

    console.log("Invite link:", inviteLink);

    const html = inviteTemplate({
      inviteLink,
      organizationName: organization.name,
      role: invitation.role
    });

    await sendEmail({
      to: email,
      subject: "Organization Invitation",
      html
    });

    res.json({
      message: "Invitation sent successfully",
      token // return token temporarily for testing
    });

  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const acceptInvite = async (req, res) => {
  try {

    const { token } = req.params;
    const { name, password } = req.body;

    console.log("Token received:", token);

    const invitation = await Invitation.findOne({
      token,
      status: "PENDING"
    });

    console.log("Invitation found:", invitation);

    if (!invitation) {

      const allInvites = await Invitation.find();

      console.log("All invitations in DB:", allInvites);

      return res.status(400).json({
        message: "Invalid or expired invitation"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
      organizationId: invitation.organizationId,
      departmentId: invitation.departmentId,
      isEmailVerified: true
    });

    invitation.status = "ACCEPTED";
    await invitation.save();

    const authToken = generateToken(user);

    res.json({
      message: "Account created successfully",
      user,
      token: authToken
    });

  } catch (error) {
    console.error("Accept invite error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};