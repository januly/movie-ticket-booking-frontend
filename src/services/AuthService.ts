import { ApiClient } from './ApiClient';
import type { AuthResponseDTO, SignInDTO, SignUpDTO, UserDTO } from '../types/api';

export class AuthService {
  static signIn(data: SignInDTO) {
    return ApiClient.request<AuthResponseDTO>('/auth/signin', { method: 'POST', data });
  }

  static signUp(data: SignUpDTO) {
    return ApiClient.request<UserDTO>('/auth/signup', { method: 'POST', data });
  }
}
