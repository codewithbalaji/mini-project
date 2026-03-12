import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import generateToken from "../utils/generateToken.js";
import { ROLES } from "../constants/roles.js";
import { sendEmail } from "../mail/sendEmail.js";
import otpTemplate from "../mail/templates/otpTemplate.js";
import resetPasswordTemplate from "../mail/templates/resetPasswordTemplate.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const organization = await Organization.create({ name: organizationName });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 30 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ROLES.ADMIN,
      organizationId: organization._id,
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpiry: otpExpiry
    });

    await sendEmail({
      to: email,
      subject: "Verify your email – Project System",
      html: otpTemplate({ name, otp })
    });

    res.json({
      userId: user._id,
      email: user.email,
      message: "Verification code sent to your email"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.emailOtp || user.emailOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (!user.emailOtpExpiry || user.emailOtpExpiry < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Request a new one." });
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "New verification code – Project System",
      html: otpTemplate({ name: user.name, otp })
    });

    res.json({ message: "New verification code sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        userId: user._id,
        email: user.email
      });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Generic message to avoid leaking whether an email is registered
    if (!user || !user.isEmailVerified) {
      return res.json({ message: "If that email is registered, you will receive a reset link" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
    await sendEmail({
      to: email,
      subject: "Reset your password – Project System",
      html: resetPasswordTemplate({ name: user.name, resetLink })
    });

    res.json({ message: "If that email is registered, you will receive a reset link" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};