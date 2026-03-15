import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import ProjectForm from "./components/ProjectForm";
import type { CreateProjectPayload } from "@/types/project.types";

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { createProject, loading } = useProjectStore();

  const handleSubmit = async (payload: CreateProjectPayload) => {
    const project = await createProject(payload);
    navigate(`/projects/${project._id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Projects
      </button>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Create New Project</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in the details to start a new project</p>
        <ProjectForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default CreateProjectPage;
