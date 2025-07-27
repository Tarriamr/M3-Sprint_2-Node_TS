import { LoginData, PublicUser, User } from '../../types';
import { readDatabase, writeDatabase } from '../../db';
import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcrypt';

const SALT_ROUNDS = 10;

export async function userExists(username: string): Promise<boolean> {
  const users = await readDatabase('users');
  return users.some((user) => user.username === username);
}

export async function createUser(userData: LoginData): Promise<PublicUser> {
  const users = await readDatabase('users');
  const hashedPassword = await hash(userData.password, SALT_ROUNDS);

  const newUser: User = {
    id: randomUUID(),
    username: userData.username,
    password: hashedPassword,
    role: 'user',
    balance: 100000,
  };
  users.push(newUser);
  await writeDatabase('users', users);
  const { password, ...publicUser } = newUser;
  return publicUser;
}

export async function verifyUserCredentials(
  username: string,
  password: string,
): Promise<PublicUser | null> {
  const users = await readDatabase('users');
  const user = users.find((user) => user.username === username);

  if (!user) {
    return null;
  }

  const isPasswordCorrect = await compare(password, user.password);

  if (!isPasswordCorrect) {
    return null;
  }

  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export async function findAllUsers(): Promise<PublicUser[]> {
  const users = (await readDatabase('users')) as User[];
  return users.map(({ password, ...publicUser }) => publicUser);
}

export async function updateUserBalance(
  userId: string,
  newBalance: number,
): Promise<void> {
  const users = await readDatabase('users');
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].balance = newBalance;
    await writeDatabase('users', users);
  }
}

export async function updateUser(
  userId: string,
  newUsername?: string,
  newPassword?: string,
): Promise<PublicUser | null> {
  const users = await readDatabase('users');
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return null;
  }

  if (newUsername) {
    users[userIndex].username = newUsername;
  }
  if (newPassword) {
    users[userIndex].password = await hash(newPassword, SALT_ROUNDS);
  }

  await writeDatabase('users', users);

  const { password, ...publicUser } = users[userIndex];
  return publicUser;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const users = await readDatabase('users');
  const initialLength = users.length;
  const updatedUsers = users.filter((u) => u.id !== userId);

  if (updatedUsers.length === initialLength) {
    return false;
  }

  await writeDatabase('users', updatedUsers);
  return true;
}

export async function fundUserAccount(
  userId: string,
  amount: number,
): Promise<PublicUser | null> {
  const users = await readDatabase('users');
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return null;
  }

  users[userIndex].balance += amount;

  await writeDatabase('users', users);

  const { password, ...publicUser } = users[userIndex];
  return publicUser;
}
