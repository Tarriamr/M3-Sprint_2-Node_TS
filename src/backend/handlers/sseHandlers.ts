import { IncomingMessage, ServerResponse } from 'node:http';
import sseEmitter from '../eventEmitter';

const clients: ServerResponse[] = [];

export function handleSse(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  clients.push(res);

  req.on('close', () => {
    clients.splice(clients.indexOf(res), 1);
  });
}

sseEmitter.on('car-bought', (data) => {
  for (const client of clients) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
});
