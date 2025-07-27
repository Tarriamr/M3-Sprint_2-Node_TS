import { IncomingMessage, ServerResponse } from 'node:http';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { extname, join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'src', 'frontend');

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

export async function staticFileMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  if (!req.url || !['/', '/style.css', '/main.js'].includes(req.url)) {
    return next();
  }

  const fileName = req.url === '/' ? '/index.html' : req.url;
  const filePath = join(PUBLIC_DIR, fileName);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return next();

    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next();
  }
}
