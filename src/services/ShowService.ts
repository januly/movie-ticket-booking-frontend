import { ApiClient } from './ApiClient';
import type { ShowDTO } from '../types/api';

export class ShowService {
  static getAll(
    params: { movieId?: string; theatreId?: string; date?: string; status?: string } = {},
  ) {
    return ApiClient.request<ShowDTO[]>('/shows', { params });
  }
  static get(id: string) {
    return ApiClient.request<ShowDTO>(`/shows/${encodeURIComponent(id)}`);
  }
  static forMovie(id: string) {
    return ApiClient.request<ShowDTO[]>(`/shows/movie/${encodeURIComponent(id)}`);
  }
}
