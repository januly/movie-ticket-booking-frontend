import axios, { type AxiosRequestConfig } from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 15000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      window.dispatchEvent(new Event('session-expired'));
    }
    return Promise.reject(error);
  },
);

export class ApiClient {
  static setToken(token: string | null) {
    if (token) {
      client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common.Authorization;
    }
  }

  static async request<T>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
    const response = await client.request<T>({ ...options, url: path });
    return response.data;
  }
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string; errors?: Record<string, string> }>(error)) {
    if (!error.response) return 'Cannot connect to the server. Please try again.';
    const details = Object.values(error.response.data?.errors || {});
    if (details.length) return details.join('. ');
    return error.response.data?.message || 'The request could not be completed.';
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
