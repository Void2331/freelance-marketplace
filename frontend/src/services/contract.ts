import { api } from "./api";

import type { Contract } from "@/types/contract";

interface ContractsResponse {
  success: boolean;
  data: {
    contracts: Contract[];
  };
}

interface ContractResponse {
  success: boolean;
  data: {
    contract: Contract;
  };
}

export async function getMyContracts(): Promise<Contract[]> {
  const response =
    await api.get<ContractsResponse>("/contracts");

  return response.data.data.contracts;
}

export async function getMyContract(
  id: string,
): Promise<Contract> {
  const response =
    await api.get<ContractResponse>(
      `/contracts/${id}`,
    );

  return response.data.data.contract;
}