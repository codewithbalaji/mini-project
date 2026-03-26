import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true
    },

    password: String,

    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "EMPLOYEE", "VIEWER"],
      default: "EMPLOYEE"
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      index: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    emailOtp: String,
    emailOtpExpiry: Date,
    passwordResetToken: String,
    passwordResetExpiry: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);