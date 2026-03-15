import express from "express";
import cors from "cors";

// Phase 1 — Auth & Organization
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";

// Phase 2 — Core Project Management
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import taskUpdateRoutes from "./routes/taskUpdateRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Phase 1 Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/organization", organizationRoutes);

// Phase 2 Routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/task-updates", taskUpdateRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;