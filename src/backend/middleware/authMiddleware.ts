import { IncomingMessage, ServerResponse } from 'node:http';
import { generateToken, getUserFromToken, setAuthCookie } from '../auth';
import { PublicUser } from '../types';

declare module 'node:http' {
  interface IncomingMessage {
    user?: PublicUser;
  }
}

export const adminAuthMiddleware = async (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => {
  const user = await getUserFromToken(req);

  if (!user) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({ error: 'Unauthorized: No or invalid token' }),
    );
  }

  if (user.role !== 'admin') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({ error: 'Forbidden: Admin access required' }),
    );
  }

  const newToken = generateToken(user);
  setAuthCookie(res, newToken);

  req.user = user;
  next();
};

export const userAuthMiddleware = async (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => {
  const user = await getUserFromToken(req);

  if (!user) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({ error: 'Unauthorized: You must be logged in' }),
    );
  }

  const newToken = generateToken(user);
  setAuthCookie(res, newToken);

  req.user = user;
  next();
};
