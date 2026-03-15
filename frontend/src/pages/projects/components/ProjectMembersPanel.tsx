import { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectStore } from "@/store/projectStore";
import { userService } from "@/services/userService";
import UserAvatar from "@/components/shared/UserAvatar";
import type { User } from "@/types/user.types";

interface ProjectMembersPanelProps {
  projectId: string;
  members: User[];
  canManage: boolean;
  departmentId?: string; // used to scope available users to the project's department
}

const ProjectMembersPanel = ({ projectId, members, canManage, departmentId }: ProjectMembersPanelProps) => {
  const { addMember, removeMember } = useProjectStore();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  useEffect(() => {
    // Pass departmentId so the API returns only dept-scoped users
    // For MANAGER: server already enforces department scoping
    // For ADMIN: departmentId param filters the result
    userService.getUsers(departmentId ? { departmentId } : undefined)
      .then(setAllUsers)
      .catch(() => {});
  }, [departmentId]);

  const memberIds = new Set(members.map((m) => m._id));
  // Only EMPLOYEE and VIEWER can be project members — managers lead the project, not join it
  const availableUsers = allUsers.filter(
    (u) => !memberIds.has(u._id) && u.role !== "MANAGER" && u.role !== "ADMIN"
  );


  const handleAdd = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await addMember(projectId, selectedUserId);
      setSelectedUserId("");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemoveTarget(userId);
    try {
      await removeMember(projectId, userId);
    } finally {
      setRemoveTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Member — only ADMIN / MANAGER */}
      {canManage && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-3 text-foreground">Add Team Member</p>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} — {u.role}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!selectedUserId || loading}
              >
                <UserPlus size={14} className="mr-1" />
                {loading ? "Adding..." : "Add"}
              </Button>
            </div>
            {availableUsers.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                All org members are already in this project.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Member list */}
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No members yet.{canManage ? " Use the form above to add team members." : ""}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m) => (
            <Card key={m._id}>
              <CardContent className="flex items-center justify-between pt-3 pb-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={m.name} size="md" />
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.email} · {m.role}
                    </p>
                  </div>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(m._id)}
                    disabled={removeTarget === m._id}
                    className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                  >
                    <X size={14} />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectMembersPanel;
