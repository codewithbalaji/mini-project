import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { userService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import type { User, Role } from "@/types/user.types";

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
  EMPLOYEE: "bg-green-100 text-green-700 border-green-200",
  VIEWER: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("EMPLOYEE");
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers() as Promise<User[]>,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      userService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated successfully");
      setRoleTarget(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to update role"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated");
      setDeactivateTarget(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to deactivate user"),
  });

  return (
    <div>
      <PageHeader title="Users" description="Manage organization members and their roles." />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : users?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={ROLE_COLORS[user.role]}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.departmentId ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user._id !== currentUser?._id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setRoleTarget(user);
                                setSelectedRole(user.role);
                              }}
                            >
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeactivateTarget(user)}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Change Role Dialog */}
      <Dialog open={!!roleTarget} onOpenChange={() => setRoleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update role for <strong>{roleTarget?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <Select
            value={selectedRole}
            onValueChange={(v) => setSelectedRole(v as Role)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="EMPLOYEE">Employee</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                roleMutation.mutate({ id: roleTarget!._id, role: selectedRole })
              }
              disabled={roleMutation.isPending}
            >
              {roleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <Dialog open={!!deactivateTarget} onOpenChange={() => setDeactivateTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate{" "}
              <strong>{deactivateTarget?.name}</strong>? They will lose access to the
              organization.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deactivateMutation.mutate(deactivateTarget!._id)}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
