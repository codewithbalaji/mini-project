import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTaskStore } from "@/store/taskStore";
import { userService } from "@/services/userService";
import type { CreateTaskPayload, Task, TaskStatus } from "@/types/task.types";
import type { Priority } from "@/types/project.types";
import type { User } from "@/types/user.types";

interface TaskFormProps {
  projectId: string;
  /** Pass a task to edit it instead of creating */
  editTask?: Task;
  onClose: () => void;
}

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"];
const PRIORITY_OPTIONS: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const fieldClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const TaskForm = ({ projectId, editTask, onClose }: TaskFormProps) => {
  const { createTask, updateTask, loading } = useTaskStore();
  const isEdit = !!editTask;

  const [form, setForm] = useState<Partial<CreateTaskPayload>>({
    title: editTask?.title ?? "",
    description: editTask?.description ?? "",
    status: editTask?.status ?? "TODO",
    priority: editTask?.priority ?? "MEDIUM",
    dueDate: editTask?.dueDate ? editTask.dueDate.substring(0, 10) : "",
    estimatedHours: editTask?.estimatedHours ?? 0,
    assignedTo:
      editTask?.assignedTo
        ? typeof editTask.assignedTo === "string"
          ? editTask.assignedTo
          : (editTask.assignedTo as User)._id
        : "",
  });

  const [members, setMembers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load project members to populate the assignee dropdown
    userService.getUsers().then(setMembers).catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) { setError("Task title is required"); return; }
    setError("");
    try {
      if (isEdit && editTask) {
        await updateTask(editTask._id, {
          ...form,
          estimatedHours: Number(form.estimatedHours),
          assignedTo: form.assignedTo || undefined,
        });
      } else {
        await createTask({
          ...form,
          projectId,
          estimatedHours: Number(form.estimatedHours),
          assignedTo: form.assignedTo || undefined,
        } as CreateTaskPayload);
      }
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to save task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Task title" required />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          placeholder="What needs to be done?"
          className={`${fieldClass} h-auto resize-none py-2`}
        />
      </div>

      {/* Assignee */}
      <div className="space-y-1.5">
        <Label htmlFor="assignedTo">Assign To</Label>
        <select id="assignedTo" name="assignedTo" value={form.assignedTo || ""} onChange={handleChange} className={fieldClass}>
          <option value="">— Unassigned —</option>
          {members
            .filter((m) => m.role === "EMPLOYEE" || m.role === "VIEWER")
            .map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.role})
              </option>
            ))}
        </select>
      </div>

      {/* Priority + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority</Label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange} className={fieldClass}>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" value={form.status} onChange={handleChange} className={fieldClass}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      {/* Due Date + Est. Hours */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input type="date" id="dueDate" name="dueDate" value={form.dueDate || ""} onChange={handleChange} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estimatedHours">Est. Hours</Label>
          <Input type="number" id="estimatedHours" name="estimatedHours" value={form.estimatedHours} onChange={handleChange} min={0} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Task")}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
