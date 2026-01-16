import { api } from "./axios";

export interface Daire {
  id: string;
  userid: string;
  daireno: string;
}

export interface DaireRequest {
  userid: string;
  daireno: string;
}

export const getDaireler = async (): Promise<Daire[]> => {
  const res = await api.get<Daire[]>("/daireler");
  return res.data;
};

export const getDairelerByUser = async (userid: string): Promise<Daire[]> => {
  const res = await api.get<Daire[]>(`/daireler/user/${userid}`);
  return res.data;
};

export const createDaire = async (payload: DaireRequest): Promise<Daire> => {
  const res = await api.post<Daire>("/daireler", payload);
  return res.data;
};

export const updateDaire = async (id: string, payload: DaireRequest): Promise<Daire> => {
  const res = await api.put<Daire>(`/daireler/${id}`, payload);
  return res.data;
};

export const deleteDaire = async (id: string): Promise<void> => {
  await api.delete(`/daireler/${id}`);
};
