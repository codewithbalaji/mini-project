import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from './config/db.js';

// Import models
import Organization from './models/Organization.js';
import Department from './models/Department.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import TaskUpdate from './models/TaskUpdate.js';
import Comment from './models/Comment.js';
import Notification from './models/Notification.js';
import Invitation from './models/Invitation.js';

// Helper to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Helper to get random items from array
const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper to get random date
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🔄 Clearing existing data...');

    // Clear all collections
    await Organization.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await TaskUpdate.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Invitation.deleteMany({});

    console.log('✅ Cleared all collections');

    // ========== ORGANIZATION 1: TechCorp Solutions ==========
    console.log('🏢 Creating Organization 1: TestOrg...');
    
    const org1 = await Organization.create({
      name: 'TestOrg',
      industry: 'Software Development'
    });

    // Departments for TechCorp
    const techDepts = await Department.insertMany([
      { name: 'Engineering', organizationId: org1._id },
      { name: 'Product Management', organizationId: org1._id },
      { name: 'Design', organizationId: org1._id },
      { name: 'Marketing', organizationId: org1._id }
    ]);

    // Users for TechCorp
    const techUsers = await User.insertMany([
      {
        name: 'Alice Admin',
        email: 'admin@testorg.com',
        password: await hashPassword('password123'),
        role: 'ADMIN',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        isEmailVerified: true
      },
      {
        name: 'Bob Manager',
        email: 'manager1@testorg.com',
        password: await hashPassword('password123'),
        role: 'MANAGER',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        isEmailVerified: true
      },
      {
        name: 'Carol Manager',
        email: 'manager2@testorg.com',
        password: await hashPassword('password123'),
        role: 'MANAGER',
        organizationId: org1._id,
        departmentId: techDepts[1]._id,
        isEmailVerified: true
      },
      {
        name: 'David Developer',
        email: 'employee1@testorg.com',
        password: await hashPassword('password123'),
        role: 'EMPLOYEE',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        isEmailVerified: true
      },
      {
        name: 'Emma Engineer',
        email: 'employee2@testorg.com',
        password: await hashPassword('password123'),
        role: 'EMPLOYEE',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        isEmailVerified: true
      },
      {
        name: 'Frank Designer',
        email: 'employee3@testorg.com',
        password: await hashPassword('password123'),
        role: 'EMPLOYEE',
        organizationId: org1._id,
        departmentId: techDepts[2]._id,
        isEmailVerified: true
      },
      {
        name: 'Grace Viewer',
        email: 'viewer@testorg.com',
        password: await hashPassword('password123'),
        role: 'VIEWER',
        organizationId: org1._id,
        departmentId: techDepts[3]._id,
        isEmailVerified: true
      }
    ]);

    // Update department managers
    await Department.findByIdAndUpdate(techDepts[0]._id, { managerId: techUsers[1]._id });
    await Department.findByIdAndUpdate(techDepts[1]._id, { managerId: techUsers[2]._id });

    // Projects for TechCorp
    const now = new Date();
    const techProjects = await Project.insertMany([
      {
        title: 'E-Commerce Platform Redesign',
        description: 'Complete overhaul of the customer-facing e-commerce platform with modern UI/UX',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 2, 30),
        budget: 150000,
        clientName: 'RetailCo Inc',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        managerId: techUsers[1]._id,
        members: [techUsers[3]._id, techUsers[4]._id, techUsers[5]._id],
        tags: ['frontend', 'backend', 'design'],
        createdBy: techUsers[1]._id
      },
      {
        title: 'Mobile App Development',
        description: 'Native iOS and Android app for customer engagement',
        status: 'PLANNING',
        priority: 'MEDIUM',
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 6, 30),
        budget: 200000,
        clientName: 'MobileFirst Corp',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        managerId: techUsers[1]._id,
        members: [techUsers[3]._id, techUsers[4]._id],
        tags: ['mobile', 'ios', 'android'],
        createdBy: techUsers[1]._id
      },
      {
        title: 'API Integration Project',
        description: 'Integrate third-party payment and shipping APIs',
        status: 'ACTIVE',
        priority: 'CRITICAL',
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        budget: 75000,
        clientName: 'PaymentHub',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        managerId: techUsers[2]._id,
        members: [techUsers[4]._id],
        tags: ['api', 'integration', 'backend'],
        createdBy: techUsers[2]._id
      },
      {
        title: 'Marketing Website Refresh',
        description: 'Update company marketing website with new branding',
        status: 'COMPLETED',
        priority: 'LOW',
        startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        budget: 30000,
        clientName: 'Internal',
        organizationId: org1._id,
        departmentId: techDepts[3]._id,
        managerId: techUsers[2]._id,
        members: [techUsers[5]._id],
        tags: ['marketing', 'website', 'design'],
        createdBy: techUsers[2]._id
      }
    ]);

    console.log(`✅ Created ${techProjects.length} projects for TechCorp`);

    // Tasks for Project 1 (E-Commerce Platform)
    const project1Tasks = await Task.insertMany([
      {
        title: 'Design new homepage layout',
        description: 'Create wireframes and mockups for the new homepage',
        status: 'DONE',
        priority: 'HIGH',
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        assignedTo: techUsers[5]._id,
        assignedBy: techUsers[1]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        completedAt: new Date(now.getFullYear(), now.getMonth() - 1, 14),
        estimatedHours: 20,
        loggedHours: 18,
        tags: ['design', 'ui'],
        order: 1
      },
      {
        title: 'Implement product catalog API',
        description: 'Build RESTful API endpoints for product management',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        assignedTo: techUsers[3]._id,
        assignedBy: techUsers[1]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        estimatedHours: 40,
        loggedHours: 25,
        tags: ['backend', 'api'],
        order: 2
      },
      {
        title: 'Setup payment gateway integration',
        description: 'Integrate Stripe payment processing',
        status: 'IN_REVIEW',
        priority: 'CRITICAL',
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        assignedTo: techUsers[4]._id,
        assignedBy: techUsers[1]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        estimatedHours: 30,
        loggedHours: 28,
        tags: ['payment', 'integration'],
        order: 3
      },
      {
        title: 'Create shopping cart component',
        description: 'Build React component for shopping cart functionality',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        assignedTo: techUsers[3]._id,
        assignedBy: techUsers[1]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
        estimatedHours: 16,
        loggedHours: 0,
        tags: ['frontend', 'react'],
        order: 4
      },
      {
        title: 'Database migration for new schema',
        description: 'Update database schema to support new product attributes',
        status: 'BLOCKED',
        priority: 'HIGH',
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        assignedTo: techUsers[4]._id,
        assignedBy: techUsers[1]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        estimatedHours: 12,
        loggedHours: 5,
        tags: ['database', 'migration'],
        order: 5
      }
    ]);

    // Tasks for Project 3 (API Integration)
    const project3Tasks = await Task.insertMany([
      {
        title: 'Research payment API documentation',
        description: 'Review Stripe and PayPal API documentation',
        status: 'DONE',
        priority: 'MEDIUM',
        projectId: techProjects[2]._id,
        organizationId: org1._id,
        assignedTo: techUsers[4]._id,
        assignedBy: techUsers[2]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
        completedAt: new Date(now.getFullYear(), now.getMonth() - 1, 18),
        estimatedHours: 8,
        loggedHours: 6,
        tags: ['research', 'api'],
        order: 1
      },
      {
        title: 'Implement webhook handlers',
        description: 'Create webhook endpoints for payment notifications',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: techProjects[2]._id,
        organizationId: org1._id,
        assignedTo: techUsers[4]._id,
        assignedBy: techUsers[2]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
        estimatedHours: 15,
        loggedHours: 8,
        tags: ['webhook', 'backend'],
        order: 2
      }
    ]);

    console.log(`✅ Created ${project1Tasks.length + project3Tasks.length} tasks for TechCorp projects`);

    // Task Updates
    const taskUpdates = await TaskUpdate.insertMany([
      {
        taskId: project1Tasks[0]._id,
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        submittedBy: techUsers[5]._id,
        updateText: 'Completed initial wireframes for homepage. Reviewed with stakeholders and incorporated feedback.',
        hoursLogged: 8,
        statusChange: 'IN_PROGRESS'
      },
      {
        taskId: project1Tasks[0]._id,
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        submittedBy: techUsers[5]._id,
        updateText: 'Finalized high-fidelity mockups. All design assets exported and ready for development.',
        hoursLogged: 10,
        statusChange: 'DONE'
      },
      {
        taskId: project1Tasks[1]._id,
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        submittedBy: techUsers[3]._id,
        updateText: 'Set up database models and basic CRUD endpoints. Working on pagination and filtering.',
        hoursLogged: 12,
        statusChange: 'IN_PROGRESS'
      },
      {
        taskId: project1Tasks[1]._id,
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        submittedBy: techUsers[3]._id,
        updateText: 'Added search functionality and optimized queries. Running performance tests.',
        hoursLogged: 13,
        statusChange: null
      },
      {
        taskId: project1Tasks[2]._id,
        projectId: techProjects[0]._id,
        organizationId: org1._id,
        submittedBy: techUsers[4]._id,
        updateText: 'Stripe integration complete. Tested payment flows. Ready for code review.',
        hoursLogged: 28,
        statusChange: 'IN_REVIEW'
      },
      {
        taskId: project3Tasks[1]._id,
        projectId: techProjects[2]._id,
        organizationId: org1._id,
        submittedBy: techUsers[4]._id,
        updateText: 'Created webhook endpoints for payment success and failure. Added logging.',
        hoursLogged: 8,
        statusChange: 'IN_PROGRESS'
      }
    ]);

    console.log(`✅ Created ${taskUpdates.length} task updates`);

    // Comments
    const comments = await Comment.insertMany([
      {
        entityType: 'TASK',
        entityId: project1Tasks[1]._id,
        organizationId: org1._id,
        author: techUsers[1]._id,
        content: 'Great progress! Make sure to add proper error handling for edge cases.'
      },
      {
        entityType: 'TASK',
        entityId: project1Tasks[1]._id,
        organizationId: org1._id,
        author: techUsers[3]._id,
        content: 'Will do! Planning to add validation middleware as well.'
      },
      {
        entityType: 'TASK',
        entityId: project1Tasks[2]._id,
        organizationId: org1._id,
        author: techUsers[1]._id,
        content: 'Looks good! Please add unit tests before we merge this.'
      },
      {
        entityType: 'PROJECT',
        entityId: techProjects[0]._id,
        organizationId: org1._id,
        author: techUsers[2]._id,
        content: 'Team is doing excellent work. Let\'s schedule a demo for next week.'
      },
      {
        entityType: 'TASK',
        entityId: project1Tasks[4]._id,
        organizationId: org1._id,
        author: techUsers[4]._id,
        content: 'Blocked waiting for DBA approval on schema changes. Following up today.'
      }
    ]);

    console.log(`✅ Created ${comments.length} comments`);

    // Notifications
    const notifications = await Notification.insertMany([
      {
        userId: techUsers[3]._id,
        organizationId: org1._id,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Implement product catalog API"',
        isRead: false,
        relatedEntity: {
          entityType: 'TASK',
          entityId: project1Tasks[1]._id
        }
      },
      {
        userId: techUsers[4]._id,
        organizationId: org1._id,
        type: 'TASK_DUE_SOON',
        title: 'Task Due Soon',
        message: 'Task "Setup payment gateway integration" is due in 3 days',
        isRead: false,
        relatedEntity: {
          entityType: 'TASK',
          entityId: project1Tasks[2]._id
        }
      },
      {
        userId: techUsers[5]._id,
        organizationId: org1._id,
        type: 'TASK_STATUS_CHANGED',
        title: 'Task Completed',
        message: 'Your task "Design new homepage layout" has been marked as DONE',
        isRead: true,
        relatedEntity: {
          entityType: 'TASK',
          entityId: project1Tasks[0]._id
        }
      },
      {
        userId: techUsers[3]._id,
        organizationId: org1._id,
        type: 'COMMENT_ADDED',
        title: 'New Comment',
        message: 'Bob Manager commented on your task',
        isRead: false,
        relatedEntity: {
          entityType: 'TASK',
          entityId: project1Tasks[1]._id
        }
      },
      {
        userId: techUsers[1]._id,
        organizationId: org1._id,
        type: 'PROJECT_CREATED',
        title: 'Project Created',
        message: 'New project "E-Commerce Platform Redesign" has been created',
        isRead: true,
        relatedEntity: {
          entityType: 'PROJECT',
          entityId: techProjects[0]._id
        }
      }
    ]);

    console.log(`✅ Created ${notifications.length} notifications`);

    // Invitations
    const invitations = await Invitation.insertMany([
      {
        email: 'newemployee@testorg.com',
        role: 'EMPLOYEE',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        token: 'invite-token-' + Math.random().toString(36).substring(7),
        status: 'PENDING',
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        invitedBy: techUsers[0]._id
      },
      {
        email: 'expiredemployee@testorg.com',
        role: 'EMPLOYEE',
        organizationId: org1._id,
        departmentId: techDepts[0]._id,
        token: 'invite-token-expired',
        status: 'EXPIRED',
        expiresAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        invitedBy: techUsers[0]._id
      }
    ]);

    console.log(`✅ Created ${invitations.length} invitations for TechCorp`);

    // ========== ORGANIZATION 2: DesignHub Agency ==========
    console.log('\n🏢 Creating Organization 2: TestOrg2...');

    const org2 = await Organization.create({
      name: 'TestOrg2',
      industry: 'Creative Services'
    });

    // Departments for DesignHub
    const designDepts = await Department.insertMany([
      { name: 'Creative', organizationId: org2._id },
      { name: 'Client Services', organizationId: org2._id }
    ]);

    // Users for DesignHub
    const designUsers = await User.insertMany([
      {
        name: 'Helen Admin',
        email: 'admin@testorg2.com',
        password: await hashPassword('password123'),
        role: 'ADMIN',
        organizationId: org2._id,
        departmentId: designDepts[0]._id,
        isEmailVerified: true
      },
      {
        name: 'Ian Manager',
        email: 'manager@testorg2.com',
        password: await hashPassword('password123'),
        role: 'MANAGER',
        organizationId: org2._id,
        departmentId: designDepts[0]._id,
        isEmailVerified: true
      },
      {
        name: 'Julia Designer',
        email: 'employee1@testorg2.com',
        password: await hashPassword('password123'),
        role: 'EMPLOYEE',
        organizationId: org2._id,
        departmentId: designDepts[0]._id,
        isEmailVerified: true
      },
      {
        name: 'Kevin Designer',
        email: 'employee2@testorg2.com',
        password: await hashPassword('password123'),
        role: 'EMPLOYEE',
        organizationId: org2._id,
        departmentId: designDepts[0]._id,
        isEmailVerified: true
      }
    ]);

    await Department.findByIdAndUpdate(designDepts[0]._id, { managerId: designUsers[1]._id });

    // Projects for DesignHub
    const designProjects = await Project.insertMany([
      {
        title: 'Brand Identity for StartupXYZ',
        description: 'Complete brand identity package including logo, colors, and guidelines',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 30),
        budget: 50000,
        clientName: 'StartupXYZ',
        organizationId: org2._id,
        departmentId: designDepts[0]._id,
        managerId: designUsers[1]._id,
        members: [designUsers[2]._id, designUsers[3]._id],
        tags: ['branding', 'logo', 'identity'],
        createdBy: designUsers[1]._id
      },
      {
        title: 'Website Redesign for TechFirm',
        description: 'Modern website redesign with focus on user experience',
        status: 'PLANNING',
        priority: 'MEDIUM',
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 3, 30),
        budget: 80000,
        clientName: 'TechFirm Inc',
        organizationId: org2._id,
        departmentId: designDepts[0]._id,
        managerId: designUsers[1]._id,
        members: [designUsers[2]._id],
        tags: ['web', 'ux', 'ui'],
        createdBy: designUsers[1]._id
      }
    ]);

    console.log(`✅ Created ${designProjects.length} projects for DesignHub`);

    // Tasks for DesignHub Project 1
    const designTasks = await Task.insertMany([
      {
        title: 'Research competitor branding',
        description: 'Analyze competitor brand identities and market positioning',
        status: 'DONE',
        priority: 'MEDIUM',
        projectId: designProjects[0]._id,
        organizationId: org2._id,
        assignedTo: designUsers[2]._id,
        assignedBy: designUsers[1]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        completedAt: new Date(now.getFullYear(), now.getMonth(), 4),
        estimatedHours: 10,
        loggedHours: 9,
        tags: ['research'],
        order: 1
      },
      {
        title: 'Create logo concepts',
        description: 'Design 3-5 initial logo concepts for client review',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: designProjects[0]._id,
        organizationId: org2._id,
        assignedTo: designUsers[3]._id,
        assignedBy: designUsers[1]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        estimatedHours: 20,
        loggedHours: 12,
        tags: ['logo', 'design'],
        order: 2
      },
      {
        title: 'Develop color palette',
        description: 'Create primary and secondary color schemes',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: designProjects[0]._id,
        organizationId: org2._id,
        assignedTo: designUsers[2]._id,
        assignedBy: designUsers[1]._id,
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
        estimatedHours: 8,
        loggedHours: 0,
        tags: ['colors', 'branding'],
        order: 3
      }
    ]);

    console.log(`✅ Created ${designTasks.length} tasks for DesignHub projects`);

    // Task Updates for DesignHub
    await TaskUpdate.insertMany([
      {
        taskId: designTasks[0]._id,
        projectId: designProjects[0]._id,
        organizationId: org2._id,
        submittedBy: designUsers[2]._id,
        updateText: 'Completed competitor analysis. Created presentation deck with findings.',
        hoursLogged: 9,
        statusChange: 'DONE'
      },
      {
        taskId: designTasks[1]._id,
        projectId: designProjects[0]._id,
        organizationId: org2._id,
        submittedBy: designUsers[3]._id,
        updateText: 'Working on logo concepts. Have 3 strong directions so far.',
        hoursLogged: 12,
        statusChange: 'IN_PROGRESS'
      }
    ]);

    // Comments for DesignHub
    await Comment.insertMany([
      {
        entityType: 'TASK',
        entityId: designTasks[1]._id,
        organizationId: org2._id,
        author: designUsers[1]._id,
        content: 'Looking forward to seeing the concepts! Remember to keep it simple and memorable.'
      },
      {
        entityType: 'PROJECT',
        entityId: designProjects[0]._id,
        organizationId: org2._id,
        author: designUsers[0]._id,
        content: 'Great start team! Client is excited to see our progress.'
      }
    ]);

    // Notifications for DesignHub
    await Notification.insertMany([
      {
        userId: designUsers[2]._id,
        organizationId: org2._id,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Develop color palette"',
        isRead: false,
        relatedEntity: {
          entityType: 'TASK',
          entityId: designTasks[2]._id
        }
      },
      {
        userId: designUsers[3]._id,
        organizationId: org2._id,
        type: 'TASK_DUE_SOON',
        title: 'Task Due Soon',
        message: 'Task "Create logo concepts" is due in 5 days',
        isRead: false,
        relatedEntity: {
          entityType: 'TASK',
          entityId: designTasks[1]._id
        }
      }
    ]);

    console.log('✅ Created notifications and comments for DesignHub');

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
    const stats = {
      organizations: await Organization.countDocuments(),
      departments: await Department.countDocuments(),
      users: await User.countDocuments(),
      projects: await Project.countDocuments(),
      tasks: await Task.countDocuments(),
      taskUpdates: await TaskUpdate.countDocuments(),
      comments: await Comment.countDocuments(),
      notifications: await Notification.countDocuments(),
      invitations: await Invitation.countDocuments()
    };

    console.log('\n📊 Database Statistics:');
    console.log(`   Organizations: ${stats.organizations}`);
    console.log(`   Departments: ${stats.departments}`);
    console.log(`   Users: ${stats.users}`);
    console.log(`   Projects: ${stats.projects}`);
    console.log(`   Tasks: ${stats.tasks}`);
    console.log(`   Task Updates: ${stats.taskUpdates}`);
    console.log(`   Comments: ${stats.comments}`);
    console.log(`   Notifications: ${stats.notifications}`);
    console.log(`   Invitations: ${stats.invitations}`);

    console.log('\n👥 Test User Credentials (password: password123):');
    console.log('\n   TestOrg:');
    console.log('   - admin@testorg.com (ADMIN)');
    console.log('   - manager1@testorg.com (MANAGER)');
    console.log('   - manager2@testorg.com (MANAGER)');
    console.log('   - employee1@testorg.com (EMPLOYEE)');
    console.log('   - employee2@testorg.com (EMPLOYEE)');
    console.log('   - employee3@testorg.com (EMPLOYEE)');
    console.log('   - viewer@testorg.com (VIEWER)');

    console.log('\n   TestOrg2:');
    console.log('   - admin@testorg2.com (ADMIN)');
    console.log('   - manager@testorg2.com (MANAGER)');
    console.log('   - employee1@testorg2.com (EMPLOYEE)');
    console.log('   - employee2@testorg2.com (EMPLOYEE)');

    console.log('\n' + '='.repeat(60));
    console.log('✨ You can now start the server and login with any user above');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

seedDatabase();
