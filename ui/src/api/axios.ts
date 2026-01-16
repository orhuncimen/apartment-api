import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;

    if (data?.message) return String(data.message);

    if (data?.errors) {
      if (Array.isArray(data.errors)) return data.errors.join(", ");
      if (typeof data.errors === "object") return Object.values(data.errors).join(", ");
      return String(data.errors);
    }

    if (data?.detail) return String(data.detail);
    if (data?.title) return String(data.title);

    if (err.response?.status) return `HTTP ${err.response.status}`;
    return err.message || "API hatası";
  }

  if (err instanceof Error) return err.message;
  return "Beklenmeyen hata";
}
