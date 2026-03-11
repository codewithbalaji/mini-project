import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Role } from "@/types/user.types";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  roles: Role[];
  children: ReactNode;
}

export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const { hasRole } = usePermissions();

  if (!hasRole(...roles)) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground py-24">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
