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
      ref: "Organization"
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);