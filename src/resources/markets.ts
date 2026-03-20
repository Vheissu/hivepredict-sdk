import type { HttpClient } from '../http.js';
import type {
  Market,
  MarketListParams,
  MarketListResponse,
  MarketFeaturedResponse,
  MarketFeedParams,
  PaginationParams,
  PredictionListResponse,
  PayoutListResponse,
  MarketSnapshotParams,
  MarketSnapshotsResponse,
  CommentListResponse,
  MarketProofParams,
  ProofListResponse,
  AdminActionsResponse,
  MarketStakeResponse,
} from '../types.js';

export class Markets {
  constructor(private readonly http: HttpClient) {}

  /** List markets with optional filters and pagination. */
  list(params?: MarketListParams): Promise<MarketListResponse> {
    return this.http.get('/api/markets', params as Record<string, unknown>);
  }

  /** Top markets by volume (max 10). */
  featured(): Promise<MarketFeaturedResponse> {
    return this.http.get('/api/markets/featured');
  }

  /** Newest open markets. */
  newest(params?: MarketFeedParams): Promise<MarketListResponse> {
    return this.http.get('/api/markets/new', params as Record<string, unknown>);
  }

  /** Open markets feed with optional sort. */
  open(params?: MarketFeedParams & { sort?: string }): Promise<MarketListResponse> {
    return this.http.get('/api/markets/open', params as Record<string, unknown>);
  }

  /** Trending markets by volume. */
  trending(params?: MarketFeedParams): Promise<MarketListResponse> {
    return this.http.get('/api/markets/trending', params as Record<string, unknown>);
  }

  /** Markets closing soonest. */
  endingSoon(params?: MarketFeedParams): Promise<MarketListResponse> {
    return this.http.get('/api/markets/ending-soon', params as Record<string, unknown>);
  }

  /** Recently resolved markets. */
  resolved(params?: MarketFeedParams): Promise<MarketListResponse> {
    return this.http.get('/api/markets/resolved', params as Record<string, unknown>);
  }

  /** Finalized markets (resolved, voided, cancelled). */
  closed(params?: MarketFeedParams): Promise<MarketListResponse> {
    return this.http.get('/api/markets/closed', params as Record<string, unknown>);
  }

  /** Full market detail with pool breakdown and participant count. */
  get(id: string): Promise<Market> {
    return this.http.get(`/api/markets/${encodeURIComponent(id)}`);
  }

  /** Predictions placed in a market. */
  predictions(id: string, params?: PaginationParams): Promise<PredictionListResponse> {
    return this.http.get(
      `/api/markets/${encodeURIComponent(id)}/predictions`,
      params as Record<string, unknown>,
    );
  }

  /** Payouts for a resolved market. */
  payouts(id: string, params?: PaginationParams): Promise<PayoutListResponse> {
    return this.http.get(
      `/api/markets/${encodeURIComponent(id)}/payouts`,
      params as Record<string, unknown>,
    );
  }

  /** Probability snapshots over time (chart data). */
  snapshots(id: string, params?: MarketSnapshotParams): Promise<MarketSnapshotsResponse> {
    return this.http.get(
      `/api/markets/${encodeURIComponent(id)}/snapshots`,
      params as Record<string, unknown>,
    );
  }

  /** Market discussion comments. */
  comments(id: string, params?: PaginationParams): Promise<CommentListResponse> {
    return this.http.get(
      `/api/markets/${encodeURIComponent(id)}/comments`,
      params as Record<string, unknown>,
    );
  }

  /** Manual outcome proofs with community votes. */
  proofs(id: string, params?: MarketProofParams): Promise<ProofListResponse> {
    return this.http.get(
      `/api/markets/${encodeURIComponent(id)}/proofs`,
      params as Record<string, unknown>,
    );
  }

  /** Admin decision history (resolutions, rejections, proof requests). */
  adminActions(id: string): Promise<AdminActionsResponse> {
    return this.http.get(`/api/markets/${encodeURIComponent(id)}/admin-actions`);
  }

  /** User's total stake in a market, broken down by outcome. */
  stake(id: string, username: string): Promise<MarketStakeResponse> {
    return this.http.get(
      `/api/markets/${encodeURIComponent(id)}/stake/${encodeURIComponent(username)}`,
    );
  }
}
