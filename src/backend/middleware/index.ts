import { IncomingMessage, ServerResponse } from 'node:http';

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void;

export function runMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  chain: Middleware[],
) {
  const queue = [...chain];

  const next = () => {
    const currentMiddleware = queue.shift();

    if (currentMiddleware) {
      currentMiddleware(req, res, next);
    }
  };

  next();
}
