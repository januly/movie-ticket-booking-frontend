import { ApiClient } from './ApiClient';
import type { MovieDTO } from '../types/api';

export class MovieService {
  static getAll() {
    return ApiClient.request<MovieDTO[]>('/movies');
  }
  static get(id: string) {
    return ApiClient.request<MovieDTO>(`/movies/${encodeURIComponent(id)}`);
  }
}
