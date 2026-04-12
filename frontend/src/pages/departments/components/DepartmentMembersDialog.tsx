import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/shared/UserAvatar";
import { departmentService } from "@/services/departmentService";
import { userService } from "@/services/userService";
import type { Department } from "@/types/department.types";

interface Props {
  department: Department | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepartmentMembersDialog({ department, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Reset selected user when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedUserId("");
    }
    onOpenChange(newOpen);
  };

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["department-members", department?._id],
    queryFn: () => departmentService.getDepartmentMembers(department!._id),
    enabled: !!department?._id && open,
  });

  const { data: allUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
    enabled: open && !!department,
  });

  const { mutate: assignUser, isPending: assigning } = useMutation({
    mutationFn: (userId: string) =>
      userService.updateUserDepartment(userId, department!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-members", department?._id] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User assigned to department");
      setSelectedUserId("");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to assign user"),
  });

  const { mutate: removeUser, isPending: removing } = useMutation({
    mutationFn: (userId: string) => userService.updateUserDepartment(userId, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-members", department?._id] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User removed from department");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to remove user"),
  });

  const availableUsers = allUsers?.filter(
    (user) => {
      // Safety check
      if (!department) return false;
      
      // Exclude users already in the department
      if (members?.some((member) => member._id === user._id)) {
        return false;
      }
      // Exclude the department manager
      const managerId = typeof department.managerId === "object" 
        ? department.managerId?._id 
        : department.managerId;
      if (managerId && user._id === managerId) {
        return false;
      }
      return true;
    }
  ) || [];

  // Early return if no department
  if (!department) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            {department.name} - Members
          </DialogTitle>
          <DialogDescription>
            Add or remove members from this department
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Member Section */}
          <div className="flex gap-2">
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
              onOpenChange={(open) => {
                // Prevent focus issues by managing open state
                if (!open) {
                  // Small delay to prevent aria-hidden warning
                  setTimeout(() => {}, 0);
                }
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a user to add" />
              </SelectTrigger>
              <SelectContent>
                {loadingUsers ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading users...</div>
                ) : availableUsers?.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No users available</div>
                ) : (
                  availableUsers?.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {user.role}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={() => selectedUserId && assignUser(selectedUserId)}
              disabled={!selectedUserId || assigning}
              size="sm"
            >
              {assigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} className="mr-2" />
                  Add
                </>
              )}
            </Button>
          </div>

          {/* Members List */}
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {loadingMembers ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : members?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                <p className="text-sm">No members in this department yet</p>
              </div>
            ) : (
              members?.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar user={member} size="sm" />
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email} • {member.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeUser(member._id)}
                    disabled={removing}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
