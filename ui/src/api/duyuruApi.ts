import { api } from "./axios";

export interface Duyuru {
  id: string;
  type: string;
  aciklama: string;
  expiredate: string; // backend string dönüyor (ISO vs). UI formatlayacağız
}

export interface DuyuruRequest {
  type: string;
  aciklama: string;
  expiredate: string; // ISO string gönder
}

export const getDuyurular = async (): Promise<Duyuru[]> => {
  const res = await api.get<Duyuru[]>("/duyurular");
  return res.data;
};

export const getActiveDuyurular = async (): Promise<Duyuru[]> => {
  const res = await api.get<Duyuru[]>("/duyurular/active");
  return res.data;
};

export const createDuyuru = async (payload: DuyuruRequest): Promise<Duyuru> => {
  const res = await api.post<Duyuru>("/duyurular", payload);
  return res.data;
};

export const updateDuyuru = async (id: string, payload: DuyuruRequest): Promise<Duyuru> => {
  const res = await api.put<Duyuru>(`/duyurular/${id}`, payload);
  return res.data;
};

export const deleteDuyuru = async (id: string): Promise<void> => {
  await api.delete(`/duyurular/${id}`);
};
