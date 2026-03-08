# AI-Based Project Management System with Intelligent Voice Agent

An **AI-powered project management platform** designed to automate task reporting and project monitoring in organizations.
The system enables employees to report work updates using **text or voice**, and automatically converts these updates into structured task data using **Artificial Intelligence and Natural Language Processing (NLP)**.

Managers and stakeholders can monitor project progress through **real-time dashboards, analytics, and automated alerts**, improving transparency, productivity, and decision-making.

This project is built using the **MERN Stack** and integrates **AI processing and voice interaction** technologies to modernize project reporting workflows.

---

# Overview

Project management in many organizations still relies on **manual communication methods** such as emails, spreadsheets, and meetings. These methods produce fragmented information that is difficult to analyze and often delay decision-making.

This platform introduces an **intelligent reporting system** where employees can submit updates through **voice or text**, which are then automatically analyzed by AI to extract meaningful project insights such as task completion status, progress percentage, and potential issues.

The system provides **centralized dashboards and analytics** that help managers and executives track project performance in real time.

---

# Key Features

## Multi-Tenant SaaS Architecture

The platform supports multiple organizations using the same system while keeping their data isolated.
Each organization operates in its own workspace with independent users, projects, and data.

---

## Organization Workspaces

Each company has its own workspace where it can:

* Manage users and roles
* Create projects
* Assign tasks
* Monitor project progress
* Configure organization settings

---

## Role-Based Access Control

The system supports multiple user roles within an organization.

### Admin (Organization Owner)

The user who signs up becomes the Admin of the organization.

Admin capabilities include:

* Managing organization settings
* Inviting and managing users
* Assigning roles
* Viewing organization-wide dashboards

---

### Manager

Managers are responsible for managing projects and teams.

Managers can:

* Create projects
* Assign tasks to employees
* Monitor team progress
* View task updates
* Generate project insights

---

### Employee

Employees perform tasks assigned by managers.

Employees can:

* View assigned tasks
* Submit task updates
* Provide voice-based updates
* Mark tasks as completed
* Track deadlines

---

### Viewer / Stakeholder

Stakeholders can monitor project performance without modifying data.

They can:

* View analytics dashboards
* Monitor project health
* Track productivity metrics

---

# Voice-Based Task Reporting

Employees can submit updates using **voice commands** through the application.

Example voice input:

> “I completed the authentication API and started working on the dashboard UI.”

The system processes the update and extracts structured information such as:

* Task status
* Completion percentage
* Next task
* Potential issues

This significantly reduces manual reporting effort and allows employees to update tasks quickly.

---

# AI-Powered Update Processing

The system uses AI models to analyze task updates submitted by employees.

AI processing capabilities include:

* Natural language understanding
* Task status extraction
* Progress detection
* Issue identification
* Automated update summarization

This transforms unstructured employee updates into structured project data.

---

# Automated Alerts and Notifications

The system automatically generates alerts and notifications for important project events.

Examples include:

* Task deadline reminders
* Delayed task alerts
* Daily team summaries
* Weekly project reports

Notifications help managers stay informed without manually reviewing updates.

---

# Productivity Analytics Dashboard

Managers and stakeholders can monitor project performance using visual dashboards.

Analytics include:

* Task completion rates
* Employee productivity
* Delayed tasks
* Project timelines
* Team workload distribution

These insights enable better decision-making and early detection of project risks.

---

# Multi-Tenant Architecture

The system supports multiple organizations using the same platform.

Each organization operates in its own isolated environment.

Example structure:

Platform
→ Organization
→ Users
→ Projects
→ Tasks
→ Updates

All records contain an `organizationId` to ensure data isolation between organizations.

---

# Application Workflow

The overall workflow of the platform is as follows:

1. A user registers and creates a new organization.
2. The system assigns that user the **Admin role**.
3. The admin invites team members and assigns roles.
4. Managers create projects within the organization.
5. Managers assign tasks to employees.
6. Employees complete tasks and submit updates using text or voice.
7. The system processes updates using AI.
8. Task data is updated and dashboards refresh in real time.
9. Alerts and notifications are triggered when necessary.
10. Stakeholders monitor project performance through analytics dashboards.

---

# System Architecture

The platform follows a **three-layer architecture**.

### Presentation Layer

Handles user interaction through a web interface.

Technology used:

* React.js

---

### Application Layer

Processes business logic and manages API communication.

Technology used:

* Node.js
* Express.js

---

### Data Layer

Stores and manages application data.

Technology used:

* MongoDB

---

### AI Processing Layer

Analyzes task updates and extracts structured information.

Technology used:

* OpenRouter AI

---

### Voice Processing Layer

Handles voice-based task reporting.

Technology used:

* ElevenLabs

---

# Technology Stack

Frontend

* React.js

Backend

* Node.js
* Express.js

Database

* MongoDB

Authentication

* JWT
* bcrypt

Artificial Intelligence

* OpenRouter AI

Voice Processing

* ElevenLabs

Email Notifications

* NodeMailer

---

# Project Structure

```
server
│
├── models
│   ├── User.js
│   ├── Organization.js
│   ├── Project.js
│   ├── Task.js
│   └── Update.js
│
├── controllers
│
├── routes
│
├── middleware
│
├── services
│
└── server.js
```

---

# Benefits

The platform provides several advantages for organizations:

* Reduces manual reporting effort
* Improves transparency in project progress
* Enables real-time project monitoring
* Detects delays and issues early
* Improves team collaboration
* Supports data-driven management decisions

---

# Future Enhancements

Potential improvements include:

* AI-based project delay prediction
* Mobile application
* Smart task assignment using AI
* Integration with Slack or Microsoft Teams
* Advanced analytics and forecasting

---

# License

This project is developed for research, academic, and experimental purposes and may evolve into a full SaaS platform in the future.
