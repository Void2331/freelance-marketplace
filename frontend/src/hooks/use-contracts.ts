import { useQuery } from "@tanstack/react-query";

import {
  getMyContract,
  getMyContracts,
} from "@/services/contract";

export const contractKeys = {
  all: ["contracts"] as const,

  lists: () =>
    [...contractKeys.all, "list"] as const,

  detail: (id: string) =>
    [...contractKeys.all, "detail", id] as const,
};

export function useMyContracts() {
  return useQuery({
    queryKey: contractKeys.lists(),
    queryFn: getMyContracts,
  });
}

export function useMyContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => getMyContract(id),
    enabled: Boolean(id),
  });
}