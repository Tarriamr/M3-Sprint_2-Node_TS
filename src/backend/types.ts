export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  balance: number;
}

export type PublicUser = Omit<User, 'password'>;

export type LoginData = Omit<User, 'id' | 'role' | 'balance'>;

export interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  ownerId: string | null;
}

export type PublicCar = Omit<Car, 'ownerId'>;
