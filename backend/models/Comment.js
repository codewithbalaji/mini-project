import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // Polymorphic target — comment can belong to a Task or a Project
    entityType: {
      type: String,
      enum: ["TASK", "PROJECT"],
      required: true
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    // Multi-tenancy key
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

commentSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);
