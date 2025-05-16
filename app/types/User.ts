export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt?: string;
  role?: string;
  twoFactorEnabled?: boolean;
}
