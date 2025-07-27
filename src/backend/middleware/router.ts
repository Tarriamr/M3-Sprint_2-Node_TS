import { IncomingMessage, ServerResponse } from 'node:http';
import { Middleware, runMiddleware } from './';

declare module 'node:http' {
  interface IncomingMessage {
    params?: Record<string, string>;
  }
}

type RouteHandler = Middleware;

interface Route {
  method: string;
  path: string;
  handlers: RouteHandler[];
}

const routes: Route[] = [];

export function addRoute(
  method: string,
  path: string,
  ...handlers: RouteHandler[]
) {
  routes.push({ method, path, handlers });
}

export function routerMiddleware(req: IncomingMessage, res: ServerResponse) {
  const { method, url } = req;

  for (const route of routes) {
    const paramNames: string[] = [];
    const regexPath = route.path.replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    const routeRegex = new RegExp(`^${regexPath}$`);
    const match = url?.match(routeRegex);

    if (route.method === method && match) {
      const params: Record<string, string> = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      req.params = params;

      runMiddleware(req, res, route.handlers);
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
}
