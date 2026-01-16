import { api } from "./axios";

export interface AppUser {
  id: string;
  username: string;
  customerId: string;
  roleId: string;
}

export interface AppUserRequest {
  username: string;
  password: string;
  customerId: string;
  roleId: string;
}

// update için: şifre boşsa göndermeyelim (backend izin veriyorsa süper)
export type AppUserUpdateRequest = {
  username: string;
  password?: string;
  customerId: string;
  roleId: string;
};

export const getUsers = async (): Promise<AppUser[]> => {
  const res = await api.get<AppUser[]>("/users");
  return res.data;
};

export const getUserById = async (id: string): Promise<AppUser> => {
  const res = await api.get<AppUser>(`/users/${id}`);
  return res.data;
};

export const createUser = async (payload: AppUserRequest): Promise<AppUser> => {
  const res = await api.post<AppUser>("/users", payload);
  return res.data;
};

export const updateUser = async (
  id: string,
  payload: AppUserUpdateRequest
): Promise<AppUser> => {
  const res = await api.put<AppUser>(`/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
