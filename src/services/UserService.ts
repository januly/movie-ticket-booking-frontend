import { ApiClient } from './ApiClient';
import type { UserDTO } from '../types/api';

export class UserService {
  static getAll() {
    return ApiClient.request<UserDTO[]>('/users');
  }
  static get(id: string) {
    return ApiClient.request<UserDTO>(`/users/${encodeURIComponent(id)}`);
  }
  static update(id: string, data: UserDTO) {
    return ApiClient.request<UserDTO>(`/users/${encodeURIComponent(id)}`, { method: 'PUT', data });
  }
  static delete(id: string) {
    return ApiClient.request<void>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
