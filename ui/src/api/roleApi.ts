import { api } from "./axios";

export interface AppRole {
  id: string;
  code: string;      // "1" gibi geliyor olabilir (db varchar)
  aciklama: string;  // "yönetici" vs
}

export interface AppRoleRequest {
  code: string;
  aciklama: string;
}

export const getRoles = async (): Promise<AppRole[]> => {
  const res = await api.get<AppRole[]>("/roles"); // <-- gerekirse "/approle"
  return res.data;
};

export const createRole = async (payload: AppRoleRequest): Promise<AppRole> => {
  const res = await api.post<AppRole>("/roles", payload);
  return res.data;
};

export const updateRole = async (
  id: string,
  payload: AppRoleRequest
): Promise<AppRole> => {
  const res = await api.put<AppRole>(`/roles/${id}`, payload);
  return res.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/roles/${id}`);
};
