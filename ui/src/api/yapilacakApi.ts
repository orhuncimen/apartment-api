import { api } from "./axios";

export interface Yapilacak {
  id: string;
  type: string;
  aciklama: string;
  expiredate: string; // ISO string
  status: string;     // backend string dönüyor (Beklemede/Devam Ediyor vs)
}

export interface YapilacakRequest {
  type: string;
  aciklama: string;
  expiredate: string; // ISO string gönder
  status: string;
}

// Liste
export const getYapilacaklar = async (): Promise<Yapilacak[]> => {
  const res = await api.get<Yapilacak[]>("/yapilacaklar");
  return res.data;
};

// Sadece not-expired
export const getNotExpiredYapilacaklar = async (): Promise<Yapilacak[]> => {
  const res = await api.get<Yapilacak[]>("/yapilacaklar/not-expired");
  return res.data;
};

// Status filter
export const getYapilacaklarByStatus = async (status: string): Promise<Yapilacak[]> => {
  const res = await api.get<Yapilacak[]>(`/yapilacaklar/status/${encodeURIComponent(status)}`);
  return res.data;
};

// Status count
export type StatusCountResponse = Record<string, number>;

export const getStatusCount = async (): Promise<StatusCountResponse> => {
  const res = await api.get<StatusCountResponse>("/yapilacaklar/status-count");
  return res.data;
};

export const getActiveStatusCount = async (): Promise<StatusCountResponse> => {
  const res = await api.get<StatusCountResponse>("/yapilacaklar/status-count/active");
  return res.data;
};

// CRUD
export const createYapilacak = async (payload: YapilacakRequest): Promise<Yapilacak> => {
  const res = await api.post<Yapilacak>("/yapilacaklar", payload);
  return res.data;
};

export const updateYapilacak = async (
  id: string,
  payload: YapilacakRequest
): Promise<Yapilacak> => {
  const res = await api.put<Yapilacak>(`/yapilacaklar/${id}`, payload);
  return res.data;
};

export const deleteYapilacak = async (id: string): Promise<void> => {
  await api.delete(`/yapilacaklar/${id}`);
};
