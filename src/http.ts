import { HivePredictError, NetworkError } from './errors.js';

export interface HttpClientOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly _fetch: typeof globalThis.fetch;
  private readonly headers: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this._fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.headers = { ...options.headers };
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url);
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            url.searchParams.set(key, value.join(','));
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      }
    }
    return url.toString();
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      ...this.headers,
      ...(init?.headers as Record<string, string> | undefined),
    };

    let response: Response;
    try {
      response = await this._fetch(url, { ...init, headers });
    } catch (error) {
      throw new NetworkError(
        `Request failed: ${url}`,
        { cause: error instanceof Error ? error : undefined },
      );
    }

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = await response.text().catch(() => null);
      }

      const message =
        body && typeof body === 'object' && 'error' in body
          ? String((body as Record<string, unknown>).error)
          : `HTTP ${response.status}`;

      throw new HivePredictError(message, response.status, body);
    }

    return response.json() as Promise<T>;
  }
}
