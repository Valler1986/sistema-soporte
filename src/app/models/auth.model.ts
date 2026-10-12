export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string | null;
  tokenType: 'Bearer' | null;
  user: AuthenticatedUser;
}
