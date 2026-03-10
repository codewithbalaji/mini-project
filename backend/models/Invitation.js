import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["MANAGER", "EMPLOYEE", "VIEWER"],
      default: "EMPLOYEE"
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },

    token: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED"],
      default: "PENDING"
    },

    expiresAt: {
      type: Date
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invitation", invitationSchema);