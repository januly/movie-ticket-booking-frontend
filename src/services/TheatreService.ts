import { ApiClient } from './ApiClient';
import type { TheatreDTO } from '../types/api';

export class TheatreService {
  static getAll() {
    return ApiClient.request<TheatreDTO[]>('/theatres');
  }
  static get(id: string) {
    return ApiClient.request<TheatreDTO>(`/theatres/${encodeURIComponent(id)}`);
  }
}
