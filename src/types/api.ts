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

export type MovieStatus = 'UPCOMING' | 'NOW_SHOWING' | 'ENDED';
export type TheatreStatus = 'ACTIVE' | 'INACTIVE';
export type ShowStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface MovieDTO {
  movieId: string;
  title: string;
  description: string;
  duration: number;
  language: string;
  genre: string;
  releaseDate: string;
  status: MovieStatus;
}

export interface TheatreDTO {
  theatreId: string;
  theatreName: string;
  location: string;
  capacity: number;
  status: TheatreStatus;
}

export interface ShowDTO {
  showId: string;
  movieId: string;
  theatreId: string;
  showDate: string;
  showTime: string;
  ticketPrice: number;
  status: ShowStatus;
}
