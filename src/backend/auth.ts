import { PublicUser } from './types';
import { IncomingMessage, ServerResponse } from 'node:http';
import { readDatabase } from './db';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

const COOKIE_NAME = 'sessionId';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('No JWT secret provided in .env file');
  }
  return secret;
}

export function generateToken(user: PublicUser): string {
  const payload = { userId: user.id, role: user.role };
  return sign(payload, getJwtSecret(), { expiresIn: '5m' });
}

export function setAuthCookie(res: ServerResponse, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Http-Only; path=/; Max-Age=300`,
  );
}

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;

    const value = rest.join('=').trim();
    if (!value) return;

    list[name] = decodeURIComponent(value);
  });

  return list;
}

interface TokenPayload extends JwtPayload {
  userId: string;
  role: 'admin' | 'user';
}

export async function getPayloadFromToken(
  req: IncomingMessage,
): Promise<TokenPayload | null> {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, getJwtSecret());
    return decoded as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(
  req: IncomingMessage,
): Promise<PublicUser | null> {
  const payload = await getPayloadFromToken(req);

  if (!payload) {
    return null;
  }

  try {
    const { userId } = payload;
    const users = await readDatabase('users');
    const user = users.find((user) => user.id === userId);

    if (!user) {
      return null;
    }

    const { password, ...publicUser } = user;
    return publicUser;
  } catch (err) {
    return null;
  }
}
