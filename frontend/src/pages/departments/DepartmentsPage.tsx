import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building2, Loader2 } from "lucide-react";
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
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { departmentService } from "@/services/departmentService";

const schema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
});
type FormData = z.infer<typeof schema>;

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const { mutate, isPending } = useMutation({
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

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organize your organization into departments."
        action={
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus size={16} className="mr-2" />
            New Department
          </Button>
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
          {departments?.map((dept) => (
            <Card key={dept._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{dept.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Created {new Date(dept.createdAt).toLocaleDateString()}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Department Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutate(data))}
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
