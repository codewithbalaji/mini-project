import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Mail, CheckSquare, Clock, FolderKanban, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { invitationService } from "@/services/invitationService";
import dashboardService from "@/services/dashboardService";
import type { User } from "@/types/user.types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin, role } = usePermissions();
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  // Admin Data
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers() as Promise<User[]>,
    enabled: isAdmin,
  });

  const { data: departments, isLoading: loadingDepts } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
    enabled: isAdmin,
  });

  const { data: invitations, isLoading: loadingInvites } = useQuery({
    queryKey: ["invitations"],
    queryFn: invitationService.getInvitations,
    enabled: isAdmin,
  });

  // Manager & Admin Data (Org Dashboard)
  const { data: orgDashboard, isLoading: loadingOrg } = useQuery({
    queryKey: ["org-dashboard"],
    queryFn: dashboardService.getOrgDashboard,
    enabled: isManager || isAdmin,
  });

  // Employee Data (My Dashboard)
  const { data: myDashboard, isLoading: loadingMy } = useQuery({
    queryKey: ["my-dashboard"],
    queryFn: dashboardService.getMyDashboard,
    enabled: isEmployee,
  });

  const pendingInvites = invitations?.filter((i) => i.status === "PENDING").length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0]} 👋`}
        description={isAdmin ? "Here's an overview of your organization." : isManager ? "Here's an overview of your department." : "Here's an overview of your tasks."}
      />

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={Array.isArray(users) ? users.length : 0}
            icon={<Users className="text-indigo-500" size={20} />}
            loading={loadingUsers}
          />
          <StatCard
            title="Departments"
            value={departments?.length ?? 0}
            icon={<Building2 className="text-emerald-500" size={20} />}
            loading={loadingDepts}
          />
          <StatCard
            title="Pending Invitations"
            value={pendingInvites}
            icon={<Mail className="text-orange-500" size={20} />}
            loading={loadingInvites}
          />
          <StatCard
            title="Active Projects"
            value={orgDashboard?.stats?.projectStatusCounts?.ACTIVE ?? 0}
            icon={<FolderKanban className="text-blue-500" size={20} />}
            loading={loadingOrg}
          />
        </div>
      )}

      {isManager && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Department Projects"
            value={orgDashboard?.stats?.totalProjects ?? 0}
            icon={<FolderKanban className="text-indigo-500" size={20} />}
            loading={loadingOrg}
          />
          <StatCard
            title="Overdue Tasks (Team)"
            value={orgDashboard?.stats?.overdueCount ?? 0}
            icon={<Clock className="text-red-500" size={20} />}
            loading={loadingOrg}
          />
          <StatCard
            title="Recent Activity"
            value={orgDashboard?.recentActivity?.length ?? 0}
            icon={<Activity className="text-emerald-500" size={20} />}
            loading={loadingOrg}
          />
        </div>
      )}

      {isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="My Total Tasks"
            value={myDashboard?.totalTasks ?? 0}
            icon={<CheckSquare className="text-indigo-500" size={20} />}
            loading={loadingMy}
          />
          <StatCard
            title="Tasks In Progress"
            value={myDashboard?.tasksByStatus?.IN_PROGRESS ?? 0}
            icon={<Activity className="text-yellow-500" size={20} />}
            loading={loadingMy}
          />
          <StatCard
            title="My Overdue Tasks"
            value={myDashboard?.overdueCount ?? 0}
            icon={<Clock className="text-red-500" size={20} />}
            loading={loadingMy}
          />
        </div>
      )}

      {/* Admin/Manager Recent Activity Preview */}
      {(isAdmin || isManager) && orgDashboard?.recentActivity && orgDashboard.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Team Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {orgDashboard.recentActivity.slice(0, 5).map(act => (
                 <div key={act._id} className="flex items-center gap-3 text-sm">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   <p><span className="font-medium">{act.submittedBy?.name}</span> updated task <span className="font-medium">{act.taskId?.title}</span></p>
                   <span className="text-muted-foreground ml-auto text-xs">{new Date(act.createdAt).toLocaleDateString()}</span>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Upcoming Tasks Preview */}
      {isEmployee && myDashboard?.upcomingTasks && myDashboard.upcomingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">My Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {myDashboard.upcomingTasks.slice(0, 5).map(task => (
                 <div key={task._id} className="flex items-center justify-between text-sm p-3 border rounded-md">
                   <div>
                     <p className="font-medium">{task.title}</p>
                     <p className="text-muted-foreground text-xs mt-1">Project: {task.projectId?.title}</p>
                   </div>
                   <div className="text-right">
                     <span className={`text-xs px-2 py-1 rounded bg-secondary`}>{task.status}</span>
                     {task.dueDate && (
                       <p className="text-xs text-muted-foreground mt-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
