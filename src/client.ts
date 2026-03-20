import { HttpClient } from './http.js';
import { Markets } from './resources/markets.js';
import { Users } from './resources/users.js';
import { Activity } from './resources/activity.js';
import { Platform, Tokens } from './resources/platform.js';
import type {
  CategoriesResponse,
  HealthResponse,
  PlatformConfig,
  PlatformStats,
  PublicApiResponse,
} from './types.js';

export interface HivePredictOptions {
  /** API base URL. Defaults to `https://hivepredict.app`. */
  baseUrl?: string;
  /** Custom `fetch` implementation (for Node <18 polyfills or testing). */
  fetch?: typeof globalThis.fetch;
  /** Custom headers sent with every request. */
  headers?: Record<string, string>;
}

export class HivePredict {
  /** Market listings, details, predictions, payouts, and more. */
  readonly markets: Markets;
  /** User profiles, eligibility, safety controls, and history. */
  readonly users: Users;
  /** Public transparency activity feed. */
  readonly activity: Activity;
  /** Supported betting token catalog and balances. */
  readonly tokens: Tokens;

  private readonly platform: Platform;

  constructor(options: HivePredictOptions = {}) {
    const http = new HttpClient({
      baseUrl: options.baseUrl ?? 'https://hivepredict.app',
      fetch: options.fetch,
      headers: {
        'X-HivePredict-SDK': 'true',
        ...options.headers,
      },
    });

    this.markets = new Markets(http);
    this.users = new Users(http);
    this.activity = new Activity(http);
    this.tokens = new Tokens(http);
    this.platform = new Platform(http);
  }

  /** Platform-wide statistics (markets, volume, users, payouts). */
  stats(): Promise<PlatformStats> {
    return this.platform.stats();
  }

  /** Runtime configuration (public, no secrets). */
  config(): Promise<PlatformConfig> {
    return this.platform.config();
  }

  /** Available market categories. */
  categories(): Promise<CategoriesResponse> {
    return this.platform.categories();
  }

  /** Service health check. */
  health(): Promise<HealthResponse> {
    return this.platform.health();
  }

  /** Public API endpoint manifest. */
  publicApi(): Promise<PublicApiResponse> {
    return this.platform.publicApi();
  }
}
