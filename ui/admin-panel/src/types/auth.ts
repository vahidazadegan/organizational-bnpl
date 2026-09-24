export type LoginRequest = {
  username: string;
  password: string;
};

export type AdminUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AdminUser;
};
