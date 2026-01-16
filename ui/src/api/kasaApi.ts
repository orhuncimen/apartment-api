import { api } from "./axios";

export interface Kasa {
  id: string;
  years: number; // backend integer -> UI number
}

export interface KasaRequest {
  years: number;
}

export const getKasalar = async (): Promise<Kasa[]> => {
  const res = await api.get<Kasa[]>("/kasa");
  return res.data;
};

export const getKasaById = async (id: string): Promise<Kasa> => {
  const res = await api.get<Kasa>(`/kasa/${id}`);
  return res.data;
};

export const createKasa = async (payload: KasaRequest): Promise<Kasa> => {
  const res = await api.post<Kasa>("/kasa", payload);
  return res.data;
};

export const updateKasa = async (id: string, payload: KasaRequest): Promise<Kasa> => {
  const res = await api.put<Kasa>(`/kasa/${id}`, payload);
  return res.data;
};

export const deleteKasa = async (id: string): Promise<void> => {
  await api.delete(`/kasa/${id}`);
};
