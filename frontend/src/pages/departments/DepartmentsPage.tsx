import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building2, Loader2, Edit2, Users, UserCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import DepartmentMembersDialog from "./components/DepartmentMembersDialog";
import { departmentService } from "@/services/departmentService";
import { userService } from "@/services/userService";
import { usePermissions } from "@/hooks/usePermissions";
import type { Department } from "@/types/department.types";

const schema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  managerId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const { isAdmin, isManager } = usePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [membersDialogDept, setMembersDialogDept] = useState<Department | null>(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
  });

  // Fetch managers for assignment dropdown (Admin only)
  const { data: managers } = useQuery({
    queryKey: ["users", "managers"],
    queryFn: async () => {
      const users = await userService.getUsers();
      return users.filter((u) => u.role === "MANAGER");
    },
    enabled: isAdmin,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", managerId: "" },
  });

  const { mutate: createMutate, isPending: creating } = useMutation({
    mutationFn: departmentService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created");
      form.reset();
      setDialogOpen(false);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to create department"),
  });

  const { mutate: editMutate, isPending: editing } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; managerId?: string } }) => 
      departmentService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated");
      form.reset();
      setEditTarget(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to update department"),
  });

  const isPending = creating || editing;

  const handleOpenCreate = () => {
    setEditTarget(null);
    form.reset({ name: "", managerId: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditTarget(dept);
    const managerId = typeof dept.managerId === "object" ? dept.managerId?._id : dept.managerId;
    form.reset({ name: dept.name, managerId: managerId || "" });
  };

  const getManagerName = (dept: Department) => {
    if (!dept.managerId) return null;
    if (typeof dept.managerId === "object") {
      return dept.managerId.name;
    }
    return null;
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organize your organization into departments."
        action={
          isAdmin && (
            <Button onClick={handleOpenCreate} size="sm">
              <Plus size={16} className="mr-2" />
              New Department
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : departments?.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Building2 className="mx-auto mb-4 text-muted-foreground/50" size={48} />
          <p className="text-sm">No departments yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments?.map((dept) => {
            const managerName = getManagerName(dept);
            return (
              <Card key={dept._id} className="relative group">
                <CardHeader className="pb-2 pr-12">
                  <CardTitle className="text-base">{dept.name}</CardTitle>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleOpenEdit(dept)}
                    >
                      <Edit2 size={16} className="text-muted-foreground" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {managerName && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <UserCircle size={14} />
                      <span className="text-xs">Manager: {managerName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="text-xs">Created {new Date(dept.createdAt).toLocaleDateString()}</span>
                    {dept.userCount !== undefined && (
                      <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded text-xs">
                        <Users size={12} />
                        {dept.userCount} member{dept.userCount !== 1 && 's'}
                      </span>
                    )}
                  </div>
                  {(isAdmin || isManager) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setMembersDialogDept(dept)}
                    >
                      <Users size={14} className="mr-2" />
                      View Members
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Department Dialog */}
      <Dialog open={dialogOpen || !!editTarget} onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setEditTarget(null);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Department" : "Create Department"}</DialogTitle>
            <DialogDescription>
              {editTarget ? "Update department details" : "Create a new department for your organization"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                const payload = {
                  name: data.name,
                  managerId: data.managerId || undefined,
                };
                if (editTarget) {
                  editMutate({ id: editTarget._id, data: payload });
                } else {
                  createMutate(payload);
                }
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isAdmin && (
                <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Manager</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a manager (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No manager</SelectItem>
                          {managers?.map((manager) => (
                            <SelectItem key={manager._id} value={manager._id}>
                              {manager.name} ({manager.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Managers can only see departments they manage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditTarget(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editTarget ? "Save Changes" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <DepartmentMembersDialog
        department={membersDialogDept}
        open={!!membersDialogDept}
        onOpenChange={(open) => !open && setMembersDialogDept(null)}
      />
    </div>
  );
}
