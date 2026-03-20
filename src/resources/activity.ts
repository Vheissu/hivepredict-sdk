import type { HttpClient } from '../http.js';
import type { ActivityListParams, ActivityFeedResponse } from '../types.js';

export class Activity {
  constructor(private readonly http: HttpClient) {}

  /** Public transparency feed of platform events. */
  list(params?: ActivityListParams): Promise<ActivityFeedResponse> {
    const query: Record<string, unknown> = {};
    if (params) {
      if (params.types && params.types.length > 0) {
        query.types = params.types.join(',');
      }
      if (params.marketId) query.marketId = params.marketId;
      if (params.account) query.account = params.account;
      if (params.page) query.page = params.page;
      if (params.limit) query.limit = params.limit;
    }
    return this.http.get('/api/activity', query);
  }
}
