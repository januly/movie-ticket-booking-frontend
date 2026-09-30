import { ApiClient } from './ApiClient';
import type { TheatreDTO } from '../types/api';

export class TheatreService {
  static create(data: TheatreDTO) {
    return ApiClient.request<TheatreDTO>('/theatres', { method: 'POST', data });
  }
  static update(id: string, data: TheatreDTO) {
    return ApiClient.request<TheatreDTO>(`/theatres/${encodeURIComponent(id)}`, {
      method: 'PUT',
      data,
    });
  }
  static delete(id: string) {
    return ApiClient.request<void>(`/theatres/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
  static getAll() {
    return ApiClient.request<TheatreDTO[]>('/theatres');
  }
  static get(id: string) {
    return ApiClient.request<TheatreDTO>(`/theatres/${encodeURIComponent(id)}`);
  }
}
