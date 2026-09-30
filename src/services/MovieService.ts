import { ApiClient } from './ApiClient';
import type { MovieDTO } from '../types/api';

export class MovieService {
  static create(data: MovieDTO) {
    return ApiClient.request<MovieDTO>('/movies', { method: 'POST', data });
  }
  static update(id: string, data: MovieDTO) {
    return ApiClient.request<MovieDTO>(`/movies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      data,
    });
  }
  static delete(id: string) {
    return ApiClient.request<void>(`/movies/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
  static getAll() {
    return ApiClient.request<MovieDTO[]>('/movies');
  }
  static get(id: string) {
    return ApiClient.request<MovieDTO>(`/movies/${encodeURIComponent(id)}`);
  }
}
