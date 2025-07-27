import * as dotenv from 'dotenv';
import { createServer } from 'http';
import './routes';
import { corsMiddleware } from './middleware/cors';
import { jsonParserMiddleware } from './middleware/jsonParser';
import { routerMiddleware } from './middleware/router';
import { Middleware, runMiddleware } from './middleware';
import { staticFileMiddleware } from './middleware/staticFileMiddleware';

dotenv.config();

const PORT = process.env.PORT || 8080;

const middlewares: Middleware[] = [
  corsMiddleware,
  staticFileMiddleware,
  jsonParserMiddleware,
  routerMiddleware,
];

const server = createServer(async (req, res) => {
  runMiddleware(req, res, middlewares);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
