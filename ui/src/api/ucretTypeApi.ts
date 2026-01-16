import { api } from "./axios";

export interface UcretType {
  id: string;
  code: string;
  aciklama: string;
}

export interface UcretTypeRequest {
  code: string;
  aciklama: string;
}

export const getUcretTypes = async (): Promise<UcretType[]> => {
  const res = await api.get<UcretType[]>("/ucrettypes");
  return res.data;
};

export const getUcretTypeById = async (id: string): Promise<UcretType> => {
  const res = await api.get<UcretType>(`/ucrettypes/${id}`);
  return res.data;
};

export const createUcretType = async (
  payload: UcretTypeRequest
): Promise<UcretType> => {
  const res = await api.post<UcretType>("/ucrettypes", payload);
  return res.data;
};

export const updateUcretType = async (
  id: string,
  payload: UcretTypeRequest
): Promise<UcretType> => {
  const res = await api.put<UcretType>(`/ucrettypes/${id}`, payload);
  return res.data;
};

export const deleteUcretType = async (id: string): Promise<void> => {
  await api.delete(`/ucrettypes/${id}`);
};
