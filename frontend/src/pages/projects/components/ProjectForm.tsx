import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { CreateProjectPayload, ProjectStatus, Priority } from "@/types/project.types";

interface ProjectFormProps {
  initialValues?: Partial<CreateProjectPayload>;
  onSubmit: (payload: CreateProjectPayload) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

const ProjectForm = ({
  initialValues = {},
  onSubmit,
  submitLabel = "Create Project",
  loading = false,
}: ProjectFormProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateProjectPayload>({
    title: initialValues.title || "",
    description: initialValues.description || "",
    status: initialValues.status || "PLANNING",
    priority: initialValues.priority || "MEDIUM",
    startDate: initialValues.startDate || "",
    dueDate: initialValues.dueDate || "",
    budget: initialValues.budget || 0,
    clientName: initialValues.clientName || "",
    tags: initialValues.tags || [],
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags?.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) =>
    setForm((prev) => ({ ...prev, tags: prev.tags?.filter((t) => t !== tag) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Project title is required"); return; }
    try {
      await onSubmit(form);
    } catch (e: any) {
      setError(e.response?.data?.message || "Something went wrong");
    }
  };

  const fieldClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Project Title *</Label>
        <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. E-Commerce Redesign" required />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="What is this project about?"
          className={`${fieldClass} h-auto resize-none py-2`}
        />
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" value={form.status} onChange={handleChange} className={fieldClass}>
            {(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"] as ProjectStatus[]).map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority</Label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange} className={fieldClass}>
            {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Priority[]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Date</Label>
          <Input type="date" id="startDate" name="startDate" value={form.startDate || ""} onChange={handleChange} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input type="date" id="dueDate" name="dueDate" value={form.dueDate || ""} onChange={handleChange} />
        </div>
      </div>

      {/* Analytics Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget ($)</Label>
          <Input type="number" id="budget" name="budget" value={form.budget || ""} onChange={handleChange} placeholder="e.g. 5000" min="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientName">Client Name (Optional)</Label>
          <Input type="text" id="clientName" name="clientName" value={form.clientName || ""} onChange={handleChange} placeholder="e.g. Acme Corp" />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add a tag & press Enter"
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {form.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive ml-0.5">×</button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
