import { describe, it, expect, vi } from 'vitest';
import { HivePredict, HivePredictError, NetworkError } from '../src/index.js';

function mockFetch(body: unknown, status = 200): typeof globalThis.fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as typeof globalThis.fetch;
}

function createClient(fetch: typeof globalThis.fetch) {
  return new HivePredict({ baseUrl: 'https://test.local', fetch });
}

describe('HivePredict', () => {
  it('defaults baseUrl to hivepredict.app', () => {
    const f = mockFetch({ status: 'ok', timestamp: '2026-01-01T00:00:00Z' });
    const client = new HivePredict({ fetch: f });
    client.health();
    expect(f).toHaveBeenCalledWith(
      'https://hivepredict.app/api/health',
      expect.objectContaining({}),
    );
  });

  it('allows custom baseUrl', () => {
    const f = mockFetch({ status: 'ok' });
    const client = createClient(f);
    client.health();
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/health',
      expect.objectContaining({}),
    );
  });

  it('sends X-HivePredict-SDK header on every request', async () => {
    const f = mockFetch({ status: 'ok', timestamp: '' });
    const client = createClient(f);
    await client.health();
    expect(f).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-HivePredict-SDK': 'true',
        }),
      }),
    );
  });

  it('allows custom headers alongside the SDK header', async () => {
    const f = mockFetch({ status: 'ok', timestamp: '' });
    const client = new HivePredict({
      baseUrl: 'https://test.local',
      fetch: f,
      headers: { 'X-Custom': 'foo' },
    });
    await client.health();
    expect(f).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-HivePredict-SDK': 'true',
          'X-Custom': 'foo',
        }),
      }),
    );
  });
});

describe('Markets', () => {
  it('list() sends correct URL', async () => {
    const f = mockFetch({ markets: [], total: 0, page: 1, limit: 20 });
    const client = createClient(f);
    const result = await client.markets.list({ category: 'crypto', page: 2 });
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/markets?category=crypto&page=2',
      expect.objectContaining({}),
    );
    expect(result.markets).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('featured() sends correct URL', async () => {
    const f = mockFetch({ markets: [] });
    const client = createClient(f);
    await client.markets.featured();
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/markets/featured',
      expect.objectContaining({}),
    );
  });

  it('get() sends correct URL with encoded id', async () => {
    const market = { id: 'abc-123', title: 'Test' };
    const f = mockFetch(market);
    const client = createClient(f);
    const result = await client.markets.get('abc-123');
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/markets/abc-123',
      expect.objectContaining({}),
    );
    expect(result.id).toBe('abc-123');
  });

  it('predictions() includes pagination params', async () => {
    const f = mockFetch({ predictions: [], total: 0, page: 1, limit: 50 });
    const client = createClient(f);
    await client.markets.predictions('m1', { page: 3, limit: 10 });
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/markets/m1/predictions?page=3&limit=10',
      expect.objectContaining({}),
    );
  });

  it('stake() sends correct URL', async () => {
    const f = mockFetch({ username: 'alice', totalStake: '100', byOutcome: {} });
    const client = createClient(f);
    await client.markets.stake('m1', 'alice');
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/markets/m1/stake/alice',
      expect.objectContaining({}),
    );
  });

  it('snapshots() passes range param', async () => {
    const f = mockFetch({ snapshots: [] });
    const client = createClient(f);
    await client.markets.snapshots('m1', { range: '1w' });
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/markets/m1/snapshots?range=1w',
      expect.objectContaining({}),
    );
  });

  it('newest() sends correct URL', async () => {
    const f = mockFetch({ markets: [], total: 0, page: 1, limit: 20 });
    const client = createClient(f);
    await client.markets.newest({ category: 'sports' });
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/markets/new?category=sports',
      expect.objectContaining({}),
    );
  });

  it('trending() sends correct URL', async () => {
    const f = mockFetch({ markets: [], total: 0, page: 1, limit: 20 });
    const client = createClient(f);
    await client.markets.trending();
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/markets/trending',
      expect.objectContaining({}),
    );
  });
});

describe('Users', () => {
  it('get() sends correct URL', async () => {
    const f = mockFetch({ user: {}, stats: {} });
    const client = createClient(f);
    await client.users.get('bob');
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/users/bob',
      expect.objectContaining({}),
    );
  });

  it('eligibility() includes action param', async () => {
    const f = mockFetch({ eligible: true, reasons: [] });
    const client = createClient(f);
    await client.users.eligibility('bob', 'create_market');
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/users/bob/eligibility?action=create_market',
      expect.objectContaining({}),
    );
  });

  it('eligibility() works without action param', async () => {
    const f = mockFetch({ eligible: true, reasons: [] });
    const client = createClient(f);
    await client.users.eligibility('bob');
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/users/bob/eligibility',
      expect.objectContaining({}),
    );
  });
});

describe('Activity', () => {
  it('list() joins types with commas', async () => {
    const f = mockFetch({ events: [], total: 0, page: 1, limit: 40 });
    const client = createClient(f);
    await client.activity.list({ types: ['bet_placed', 'market_created'] });
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/activity?types=bet_placed%2Cmarket_created',
      expect.objectContaining({}),
    );
  });
});

describe('Platform', () => {
  it('stats() sends correct URL', async () => {
    const f = mockFetch({ totalMarkets: 10 });
    const client = createClient(f);
    await client.stats();
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/stats',
      expect.objectContaining({}),
    );
  });

  it('categories() sends correct URL', async () => {
    const f = mockFetch({ categories: [] });
    const client = createClient(f);
    await client.categories();
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/categories',
      expect.objectContaining({}),
    );
  });
});

describe('Tokens', () => {
  it('list() sends correct URL', async () => {
    const f = mockFetch({ tokens: [] });
    const client = createClient(f);
    await client.tokens.list();
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/tokens',
      expect.objectContaining({}),
    );
  });

  it('balance() sends correct URL', async () => {
    const f = mockFetch({ account: 'bob', symbol: 'HIVE', balance: '100' });
    const client = createClient(f);
    await client.tokens.balance('bob', 'HIVE');
    expect(f).toHaveBeenCalledWith(
      'https://test.local/api/tokens/balance/bob/HIVE',
      expect.objectContaining({}),
    );
  });
});

describe('Error handling', () => {
  it('throws HivePredictError on non-ok response', async () => {
    const f = mockFetch({ error: 'Market not found' }, 404);
    const client = createClient(f);
    await expect(client.markets.get('nope')).rejects.toThrow(HivePredictError);
    await expect(client.markets.get('nope')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Market not found',
    });
  });

  it('throws NetworkError on fetch failure', async () => {
    const f = vi.fn().mockRejectedValue(new TypeError('fetch failed')) as unknown as typeof globalThis.fetch;
    const client = createClient(f);
    await expect(client.health()).rejects.toThrow(NetworkError);
  });
});
