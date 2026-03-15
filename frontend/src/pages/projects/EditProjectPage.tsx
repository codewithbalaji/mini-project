import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import ProjectForm from "./components/ProjectForm";
import type { CreateProjectPayload } from "@/types/project.types";

const EditProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject, fetchProjectById, updateProject, loading } = useProjectStore();

  useEffect(() => {
    if (id) fetchProjectById(id);
  }, [id]);

  const handleSubmit = async (payload: CreateProjectPayload) => {
    if (!id) return;
    await updateProject(id, payload);
    navigate(`/projects/${id}`);
  };

  if (!selectedProject) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Edit Project</h1>
        <p className="text-sm text-gray-500 mb-6">Update the project details</p>
        <ProjectForm
          initialValues={selectedProject as any}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default EditProjectPage;
