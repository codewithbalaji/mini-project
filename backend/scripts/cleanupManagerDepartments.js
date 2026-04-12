import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Department from "../models/Department.js";

dotenv.config();

async function cleanupManagerDepartments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all departments with managers
    const departments = await Department.find({ managerId: { $exists: true, $ne: null } });
    
    console.log(`Found ${departments.length} departments with managers`);

    let cleanedCount = 0;

    for (const dept of departments) {
      // Check if the manager has this department as their departmentId
      const manager = await User.findOne({
        _id: dept.managerId,
        departmentId: dept._id
      });

      if (manager) {
        console.log(`Cleaning: ${manager.name} is manager of ${dept.name} but also listed as member`);
        manager.departmentId = null;
        await manager.save();
        cleanedCount++;
      }
    }

    console.log(`\nCleanup complete! Fixed ${cleanedCount} manager(s)`);
    
    // Show current state
    console.log("\n--- Current Department State ---");
    const allDepts = await Department.find().populate("managerId", "name email");
    for (const dept of allDepts) {
      const memberCount = await User.countDocuments({
        departmentId: dept._id,
        _id: { $ne: dept.managerId }
      });
      console.log(`${dept.name}: Manager=${dept.managerId?.name || 'None'}, Members=${memberCount}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanupManagerDepartments();
