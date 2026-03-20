/**
 * Integration tests against the live HivePredict API.
 * Run with: npx vitest run test/live.test.ts
 *
 * These tests verify the SDK works end-to-end and that our types
 * match the actual API responses. Skip in CI (no network).
 */
import { describe, it, expect } from 'vitest';
import { HivePredict } from '../src/index.js';

const hp = new HivePredict();

describe('Live API', () => {
  it('health()', async () => {
    const res = await hp.health();
    expect(res.status).toBe('ok');
    expect(res.timestamp).toBeTruthy();
  });

  it('stats()', async () => {
    const res = await hp.stats();
    expect(res.totalMarkets).toBeGreaterThan(0);
    expect(res.totalUsers).toBeGreaterThan(0);
    expect(res.totalPredictions).toBeGreaterThan(0);
    expect(typeof res.totalVolume).toBe('string');
  });

  it('categories()', async () => {
    const res = await hp.categories();
    expect(res.categories.length).toBeGreaterThan(0);
    const ids = res.categories.map((c) => c.id);
    expect(ids).toContain('crypto');
    expect(ids).toContain('sports');
  });

  it('config()', async () => {
    const res = await hp.config();
    expect(res.hivePlatformAccount).toBe('hivepredict');
    expect(typeof res.burnFeeRate).toBe('number');
    expect(typeof res.marketCreationFee).toBe('number');
  });

  it('tokens.list()', async () => {
    const res = await hp.tokens.list();
    expect(res.tokens.length).toBeGreaterThan(0);
    const symbols = res.tokens.map((t) => t.symbol);
    expect(symbols).toContain('HIVE');
    expect(symbols).toContain('HBD');
  });

  it('markets.list()', async () => {
    const res = await hp.markets.list({ limit: 2 });
    expect(res.markets.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
    expect(res.page).toBe(1);

    const market = res.markets[0];
    expect(market.id).toBeTruthy();
    expect(market.title).toBeTruthy();
    expect(market.status).toBeTruthy();
    expect(market.outcomes.length).toBeGreaterThanOrEqual(2);
    expect(typeof market.yesPool).toBe('string');
    expect(typeof market.noPool).toBe('string');
    expect(typeof market.outcomePools).toBe('object');
    expect(typeof market.tradingCutoff).toBe('string');
  });

  it('markets.featured()', async () => {
    const res = await hp.markets.featured();
    expect(res.markets).toBeDefined();
    expect(Array.isArray(res.markets)).toBe(true);
    // featured() returns { markets } only — no total/page/limit
    expect('total' in res).toBe(false);
  });

  it('markets.get() with a real market', async () => {
    const list = await hp.markets.list({ limit: 1 });
    const id = list.markets[0].id;

    const market = await hp.markets.get(id);
    expect(market.id).toBe(id);
    expect(market.onChainId).toBe(id);
    expect(typeof market.participantCount).toBe('number');
    expect(market.title).toBeTruthy();
  });

  it('markets.predictions() for a market', async () => {
    const list = await hp.markets.list({ limit: 1 });
    const id = list.markets[0].id;

    const res = await hp.markets.predictions(id, { limit: 5 });
    expect(res.predictions).toBeDefined();
    expect(typeof res.total).toBe('number');
  });

  it('markets.snapshots() for a market', async () => {
    // Use a resolved market — more likely to have snapshots
    const list = await hp.markets.resolved({ limit: 1 });
    if (list.markets.length === 0) return; // skip if no resolved markets
    const id = list.markets[0].id;

    const res = await hp.markets.snapshots(id, { range: 'all' });
    expect(res.snapshots).toBeDefined();
  });

  it('markets.comments() for a market', async () => {
    const list = await hp.markets.list({ limit: 1 });
    const id = list.markets[0].id;

    const res = await hp.markets.comments(id, { limit: 5 });
    expect(res.comments).toBeDefined();
    expect(typeof res.total).toBe('number');
  });

  it('activity.list()', async () => {
    const res = await hp.activity.list({ limit: 3 });
    expect(res.events.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);

    const event = res.events[0];
    expect(event.eventType).toBeTruthy();
    expect(event.account).toBeTruthy();
    expect(event.txId).toBeTruthy();
  });

  it('users.get() with a known user', async () => {
    const activity = await hp.activity.list({ limit: 1 });
    const username = activity.events[0].account;

    const res = await hp.users.get(username);
    expect(res.user.hiveUsername).toBe(username);
    expect(res.stats).toBeDefined();
    expect(typeof res.stats.totalPredictions).toBe('number');
  });
});
