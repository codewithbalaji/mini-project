import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/organization", organizationRoutes);

export default app;