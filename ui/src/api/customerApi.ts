import { api } from "./axios";

export interface Customer {
  id: string;
  name: string;
  surname: string;
  tel: string;
  email: string;
}

export interface CustomerRequest {
  name: string;
  surname: string;
  tel: string;
  email: string;
}

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get<Customer[]>("/customers");
  return response.data;
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  const response = await api.get<Customer>(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (
  payload: CustomerRequest
): Promise<Customer> => {
  const response = await api.post<Customer>("/customers", payload);
  return response.data;
};

export const updateCustomer = async (
  id: string,
  payload: CustomerRequest
): Promise<Customer> => {
  const response = await api.put<Customer>(`/customers/${id}`, payload);
  return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};
