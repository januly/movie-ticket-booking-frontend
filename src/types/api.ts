export type Role = 'ADMIN' | 'CUSTOMER';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface SignInDTO {
  email: string;
  password: string;
}

export interface SignUpDTO extends SignInDTO {
  name: string;
}

export interface AuthResponseDTO {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserDTO;
}
