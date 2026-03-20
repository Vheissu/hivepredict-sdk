import type { HttpClient } from '../http.js';
import type {
  EligibilityAction,
  EligibilityResponse,
  MarketListResponse,
  PaginationParams,
  PredictionListResponse,
  UserProfileResponse,
  UserSafetyResponse,
} from '../types.js';

export class Users {
  constructor(private readonly http: HttpClient) {}

  /** User profile with stats and avatar. */
  get(username: string): Promise<UserProfileResponse> {
    return this.http.get(`/api/users/${encodeURIComponent(username)}`);
  }

  /** Check if a user meets eligibility requirements. */
  eligibility(username: string, action?: EligibilityAction): Promise<EligibilityResponse> {
    return this.http.get(
      `/api/users/${encodeURIComponent(username)}/eligibility`,
      action ? { action } : undefined,
    );
  }

  /** User safety controls, spending limits, and event history. */
  safety(username: string): Promise<UserSafetyResponse> {
    return this.http.get(`/api/users/${encodeURIComponent(username)}/safety`);
  }

  /** User's prediction history. */
  predictions(username: string, params?: PaginationParams): Promise<PredictionListResponse> {
    return this.http.get(
      `/api/users/${encodeURIComponent(username)}/predictions`,
      params as Record<string, unknown>,
    );
  }

  /** Markets created by this user. */
  markets(username: string, params?: PaginationParams): Promise<MarketListResponse> {
    return this.http.get(
      `/api/users/${encodeURIComponent(username)}/markets`,
      params as Record<string, unknown>,
    );
  }
}
