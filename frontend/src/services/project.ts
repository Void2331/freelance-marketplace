import { api } from "./api";
import type {
  Project,
  Workroom,
} from "@/types/project";

interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
  };
}

interface ProjectResponse {
  success: boolean;
  message?: string;
  data: {
    project: Project;
  };
}

interface WorkroomResponse {
  success: boolean;
  data: Workroom;
}

export async function getMyProjects(): Promise<Project[]> {
  const response =
    await api.get<ProjectsResponse>(
      "/projects",
    );

  return response.data.data.projects;
}

export async function getProject(
  id: string,
): Promise<Project> {
  const response =
    await api.get<ProjectResponse>(
      `/projects/${id}`,
    );

  return response.data.data.project;
}

export async function cancelProject(
  id: string,
): Promise<Project> {
  const response =
    await api.patch<ProjectResponse>(
      `/projects/${id}/cancel`,
    );

  return response.data.data.project;
}

export async function completeProject(
  id: string,
): Promise<Project> {
  const response =
    await api.patch<ProjectResponse>(
      `/projects/${id}/complete`,
    );

  return response.data.data.project;
}

export async function getWorkroom(
  projectId: string,
): Promise<Workroom> {
  const response =
    await api.get<WorkroomResponse>(
      `/projects/${projectId}/workroom`,
    );

  return response.data.data;
}

export async function getAllProjects(): Promise<Project[]> {
  const response =
    await api.get<ProjectsResponse>(
      "/admin/projects",
    );

  return response.data.data.projects;
}
