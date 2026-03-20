import type { HttpClient } from '../http.js';
import type {
  CategoriesResponse,
  HealthResponse,
  PlatformConfig,
  PlatformStats,
  PublicApiResponse,
  TokenBalanceResponse,
  TokenListResponse,
} from '../types.js';

export class Tokens {
  constructor(private readonly http: HttpClient) {}

  /** List all supported betting tokens. */
  list(): Promise<TokenListResponse> {
    return this.http.get('/api/tokens');
  }

  /** Best-effort token balance lookup. */
  balance(username: string, symbol: string): Promise<TokenBalanceResponse> {
    return this.http.get(
      `/api/tokens/balance/${encodeURIComponent(username)}/${encodeURIComponent(symbol)}`,
    );
  }
}

export class Platform {
  constructor(private readonly http: HttpClient) {}

  /** Platform-wide statistics. */
  stats(): Promise<PlatformStats> {
    return this.http.get('/api/stats');
  }

  /** Runtime configuration (public, no secrets). */
  config(): Promise<PlatformConfig> {
    return this.http.get('/api/config');
  }

  /** Available market categories. */
  categories(): Promise<CategoriesResponse> {
    return this.http.get('/api/categories');
  }

  /** Service health check. */
  health(): Promise<HealthResponse> {
    return this.http.get('/api/health');
  }

  /** Public API endpoint manifest. */
  publicApi(): Promise<PublicApiResponse> {
    return this.http.get('/api/public');
  }
}
