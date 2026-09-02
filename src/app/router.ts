/**
 * Lightweight zero-dependency regex-safe HTTP router for Cloudflare Workers.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ALL';
export type RouteHandler<TContext = unknown> = (
  request: Request,
  params: Record<string, string>,
  ctx: TContext
) => Promise<Response> | Response;

interface RouteRecord<TContext> {
  method: HttpMethod;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler<TContext>;
}

export class Router<TContext = unknown> {
  private routes: RouteRecord<TContext>[] = [];

  add(method: HttpMethod, path: string, handler: RouteHandler<TContext>): this {
    const paramNames: string[] = [];
    const regexPattern = path
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');

    const pattern = new RegExp(`^${regexPattern}$`);
    this.routes.push({ method, pattern, paramNames, handler });
    return this;
  }

  get(path: string, handler: RouteHandler<TContext>): this {
    return this.add('GET', path, handler);
  }

  post(path: string, handler: RouteHandler<TContext>): this {
    return this.add('POST', path, handler);
  }

  patch(path: string, handler: RouteHandler<TContext>): this {
    return this.add('PATCH', path, handler);
  }

  delete(path: string, handler: RouteHandler<TContext>): this {
    return this.add('DELETE', path, handler);
  }

  async handle(request: Request, ctx: TContext): Promise<Response | null> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase() as HttpMethod;

    for (const route of this.routes) {
      if (route.method !== 'ALL' && route.method !== method) {
        continue;
      }

      const match = pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        for (let i = 0; i < route.paramNames.length; i++) {
          params[route.paramNames[i]] = decodeURIComponent(match[i + 1]);
        }
        return route.handler(request, params, ctx);
      }
    }

    return null;
  }
}
