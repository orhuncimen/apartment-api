import { api } from "./axios";

type AnyObj = Record<string, any>;

export interface AppUser {
  id: string;
  app_user: string;
  customerid: string;
  roleid: string;
}

export interface AppUserRequest {
  app_user: string;
  app_password?: string; // editte boşsa göndermeyeceğiz
  customerid: string;
  roleid: string;
}

function pickUser(raw: AnyObj): AppUser {
  return {
    id: String(raw?.id ?? ""),
    app_user: String(raw?.app_user ?? raw?.appUser ?? raw?.username ?? ""),
    customerid: String(raw?.customerid ?? raw?.customerId ?? ""),
    roleid: String(raw?.roleid ?? raw?.roleId ?? ""),
  };
}

export const getUsers = async (): Promise<AppUser[]> => {
  const res = await api.get<any[]>("/users");
  return (res.data ?? []).map(pickUser);
};

export const getUserById = async (id: string): Promise<AppUser> => {
  const res = await api.get<any>(`/users/${id}`);
  return pickUser(res.data);
};

export const createUser = async (payload: AppUserRequest): Promise<AppUser> => {
  const res = await api.post<any>("/users", payload);
  return pickUser(res.data);
};

export const updateUser = async (id: string, payload: AppUserRequest): Promise<AppUser> => {
  const res = await api.put<any>(`/users/${id}`, payload);
  return pickUser(res.data);
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
