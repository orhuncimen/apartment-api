import { api } from "./axios";

export type KasaDirection = "IN" | "OUT";

export interface KasaHareket {
  id: string;
  kasaid: string;
  daireid?: string | null;
  ucrettypeid?: string | null;
  amount: number; // backend numeric -> UI number
  direction: KasaDirection;
  description?: string | null;
}

export interface KasaHareketRequest {
  kasaid: string;
  daireid?: string | null;
  ucrettypeid?: string | null;
  amount: number;
  direction: KasaDirection;
  description?: string | null;
}

export interface KasaOzet {
  kasaid: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  hareketCount: number;
  inCount: number;
  outCount: number;
  lastTransactionDate?: string | null; // LocalDateTime string
}

export interface KasaGunlukOzet {
  date: string; // yyyy-mm-dd
  totalIn: number;
  totalOut: number;
}

export interface KasaAylikOzet {
  kasaid: string;
  year: number;
  month: number;
  totalIn: number;
  totalOut: number;
  balance: number;
  hareketCount: number;
  inCount: number;
  outCount: number;
  daily: KasaGunlukOzet[];
}

export const getKasaHareketByKasa = async (kasaid: string): Promise<KasaHareket[]> => {
  const res = await api.get<KasaHareket[]>(`/kasa-hareket/kasa/${kasaid}`);
  return res.data;
};

export const createKasaHareket = async (
  payload: KasaHareketRequest
): Promise<KasaHareket> => {
  const res = await api.post<KasaHareket>("/kasa-hareket", payload);
  return res.data;
};

export const deleteKasaHareket = async (id: string): Promise<void> => {
  await api.delete(`/kasa-hareket/${id}`);
};

export const getKasaSummary = async (kasaid: string): Promise<KasaOzet> => {
  const res = await api.get<KasaOzet>(`/kasa-hareket/kasa/${kasaid}/summary`);
  return res.data;
};

/**
 * Not: Backend'in monthly-summary endpointi year/month paramı istiyor olabilir.
 * Aşağıdaki gibi query param basıyoruz: ?year=2026&month=1
 */
export const getKasaMonthlySummary = async (
  kasaid: string,
  year: number,
  month: number
): Promise<KasaAylikOzet> => {
  const res = await api.get<KasaAylikOzet>(
    `/kasa-hareket/kasa/${kasaid}/monthly-summary`,
    { params: { year, month } }
  );
  return res.data;
};
