export type UserRole = 'admin' | 'director' | 'hr' | 'manager' | 'employee';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  created_at: Date;
}

export interface AuthData {
  userID: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}
