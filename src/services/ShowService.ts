import { ApiClient } from './ApiClient';
import type { ShowDTO, SeatAvailabilityDTO } from '../types/api';

export class ShowService {
  static getSeats(id: string) {
    return ApiClient.request<SeatAvailabilityDTO>(`/shows/${encodeURIComponent(id)}/seats`);
  }
  static create(data: ShowDTO) {
    return ApiClient.request<ShowDTO>('/shows', { method: 'POST', data });
  }
  static update(id: string, data: ShowDTO) {
    return ApiClient.request<ShowDTO>(`/shows/${encodeURIComponent(id)}`, { method: 'PUT', data });
  }
  static delete(id: string) {
    return ApiClient.request<void>(`/shows/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
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
