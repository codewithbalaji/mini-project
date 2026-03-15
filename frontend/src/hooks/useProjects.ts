import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";

export const useProjects = (params?: { status?: string; priority?: string; departmentId?: string }) => {
  const { projects, loading, error, fetchProjects, selectedProject, fetchProjectById, createProject, updateProject, deleteProject, addMember, removeMember, setSelectedProject } = useProjectStore();

  useEffect(() => {
    fetchProjects(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    projects,
    loading,
    error,
    selectedProject,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    setSelectedProject,
  };
};
