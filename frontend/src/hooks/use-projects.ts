import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelProject,
  completeProject,
  getAllProjects,
  getMyProjects,
  getProject,
  getWorkroom,
} from "@/services/project";

export const projectKeys = {
  all: ["projects"] as const,

  mine: () =>
    [...projectKeys.all, "mine"] as const,

  detail: (id: string) =>
    [...projectKeys.all, "detail", id] as const,

  admin: () =>
    [...projectKeys.all, "admin"] as const,

  workroom: (id: string) =>
    [...projectKeys.all, "workroom", id] as const,
};

export function useMyProjects() {
  return useQuery({
    queryKey: projectKeys.mine(),
    queryFn: getMyProjects,
  });
}

export function useProject(
  id?: string,
) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ""),
    queryFn: () => getProject(id!),
    enabled: Boolean(id),
  });
}

export function useWorkroom(
  id?: string,
) {
  return useQuery({
    queryKey: projectKeys.workroom(id ?? ""),
    queryFn: () => getWorkroom(id!),
    enabled: Boolean(id),
  });
}

export function useCancelProject() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: cancelProject,

    onSuccess: (project) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.mine(),
      });

      queryClient.setQueryData(
        projectKeys.detail(project._id),
        project,
      );

      queryClient.invalidateQueries({
        queryKey: projectKeys.workroom(
          project._id,
        ),
      });
    },
  });
}

export function useCompleteProject() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: completeProject,

    onSuccess: (project) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.mine(),
      });

      queryClient.setQueryData(
        projectKeys.detail(project._id),
        project,
      );

      queryClient.invalidateQueries({
        queryKey: projectKeys.workroom(
          project._id,
        ),
      });
    },
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: projectKeys.admin(),
    queryFn: getAllProjects,
  });
}
