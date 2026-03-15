import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTaskStore } from "@/store/taskStore";
import type { TaskStatus } from "@/types/task.types";

interface TaskUpdateFormProps {
  taskId: string;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
];

const fieldClass = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const TaskUpdateForm = ({ taskId }: TaskUpdateFormProps) => {
  const { submitUpdate } = useTaskStore();
  const [updateText, setUpdateText] = useState("");
  const [hoursLogged, setHoursLogged] = useState<number | "">("");
  const [statusChange, setStatusChange] = useState<TaskStatus | "">("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) { setError("Update text is required"); return; }
    setLoading(true);
    setError("");
    try {
      await submitUpdate({
        taskId,
        updateText,
        hoursLogged: hoursLogged !== "" ? Number(hoursLogged) : undefined,
        statusChange: statusChange || undefined,
      });
      setUpdateText("");
      setHoursLogged("");
      setStatusChange("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to submit update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <p className="text-sm font-semibold">Submit Update</p>
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          ✓ Update submitted successfully!
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="updateText">What did you work on? *</Label>
          <textarea
            id="updateText"
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            rows={3}
            placeholder="Describe your progress, blockers, or next steps..."
            className={`${fieldClass} resize-none`}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hoursLogged">Hours Logged</Label>
            <input
              id="hoursLogged"
              type="number"
              min={0}
              step={0.5}
              value={hoursLogged}
              onChange={(e) => setHoursLogged(e.target.value ? Number(e.target.value) : "")}
              placeholder="0"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="statusChange">Change Status (optional)</Label>
            <select
              id="statusChange"
              value={statusChange}
              onChange={(e) => setStatusChange(e.target.value as TaskStatus | "")}
              className={fieldClass}
            >
              <option value="">— No change —</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Update"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskUpdateForm;
