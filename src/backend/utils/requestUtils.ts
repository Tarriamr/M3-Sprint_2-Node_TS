import { IncomingMessage } from 'node:http';

export function getJsonBody<BodyType>(req: IncomingMessage): Promise<BodyType> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('error', (err) => reject(err));
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const bodyBuffer = Buffer.concat(chunks);
        const bodyString = bodyBuffer.toString();
        const parsedBody = JSON.parse(bodyString);
        resolve(parsedBody as BodyType);
      } catch (err) {
        reject(err);
      }
    });
  });
}
