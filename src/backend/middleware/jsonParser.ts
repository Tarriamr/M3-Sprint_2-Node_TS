import { IncomingMessage, ServerResponse } from 'node:http';
import { getJsonBody } from '../utils/requestUtils';

declare module 'node:http' {
  interface IncomingMessage {
    body?: unknown;
  }
}

export async function jsonParserMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  const contentType = req.headers['content-type'];

  if (
    (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') &&
    contentType === 'application/json'
  ) {
    try {
      req.body = await getJsonBody(req);
      next();
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    }
  } else {
    next();
  }
}
