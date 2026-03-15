import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { invitationService } from "@/services/invitationService";
import type { User } from "@/types/user.types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();

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

  const pendingInvites = invitations?.filter((i) => i.status === "PENDING").length ?? 0;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0]} 👋`}
        description="Here's an overview of your organization."
      />

      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      ) : (
        <Card className="max-w-md">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Your dashboard will show your assigned projects and tasks here in Phase 2.
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
