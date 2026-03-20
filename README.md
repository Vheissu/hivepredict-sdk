# hivepredict

Official TypeScript SDK for the [HivePredict](https://hivepredict.app) prediction market platform.

- Zero dependencies — uses native `fetch`
- Works in Node.js 18+, Deno, Bun, and modern browsers
- Full TypeScript types for every endpoint and response
- ESM and CommonJS dual-package
- Operation builders for broadcasting to the Hive blockchain

## Install

```bash
npm install hivepredict
```

## Quick Start

```typescript
import { HivePredict } from 'hivepredict';

const hp = new HivePredict();

// Get platform stats
const stats = await hp.stats();
console.log(`${stats.totalMarkets} markets, ${stats.totalUsers} users`);

// List trending markets
const { markets } = await hp.markets.trending({ category: 'crypto' });

// Get a single market with full pool breakdown
const market = await hp.markets.get('market-on-chain-id');
console.log(`${market.title}: YES ${market.yesPool} / NO ${market.noPool}`);

// User profile
const { user, stats: userStats } = await hp.users.get('alice');
console.log(`Win rate: ${userStats.winRate}`);
```

## Configuration

```typescript
const hp = new HivePredict({
  // API base URL (defaults to https://hivepredict.app)
  baseUrl: 'https://hivepredict.app',

  // Custom headers
  headers: { 'X-Custom': 'value' },

  // Custom fetch implementation (for testing or polyfills)
  fetch: customFetch,
});
```

## Reading Data

### Markets

```typescript
// Listings
hp.markets.list({ status, category, token, marketGroup, sort, page, limit })
hp.markets.featured()
hp.markets.newest({ category, token, marketGroup, page, limit })
hp.markets.open({ category, token, marketGroup, sort, page, limit })
hp.markets.trending({ category, token, marketGroup, page, limit })
hp.markets.endingSoon({ category, token, marketGroup, page, limit })
hp.markets.resolved({ category, token, marketGroup, page, limit })
hp.markets.closed({ category, token, marketGroup, page, limit })

// Detail
hp.markets.get(id)
hp.markets.predictions(id, { page, limit })
hp.markets.payouts(id, { page, limit })
hp.markets.snapshots(id, { range })          // range: '1d' | '1w' | '1m' | 'all'
hp.markets.comments(id, { page, limit })
hp.markets.proofs(id, { page, limit, username })
hp.markets.adminActions(id)
hp.markets.stake(id, username)
```

### Users

```typescript
hp.users.get(username)
hp.users.eligibility(username, action?)      // action: 'predict' | 'create_market'
hp.users.safety(username)
hp.users.predictions(username, { page, limit })
hp.users.markets(username, { page, limit })
```

### Activity Feed

```typescript
hp.activity.list({
  types: ['bet_placed', 'market_created'],   // filter by event type
  marketId: 'market-id',                     // filter by market
  account: 'username',                       // filter by user
  page: 1,
  limit: 40,
})
```

### Platform

```typescript
hp.stats()            // totalMarkets, activeMarkets, totalVolume, etc.
hp.config()           // platform configuration (fees, accounts, thresholds)
hp.categories()       // available market categories
hp.health()           // service health check
hp.publicApi()        // API endpoint manifest
```

### Tokens

```typescript
hp.tokens.list()                             // all supported betting tokens
hp.tokens.balance(username, symbol)          // token balance lookup
```

## Writing to the Blockchain

All state changes on HivePredict happen via Hive `custom_json` operations. The SDK provides type-safe operation builders that produce payloads compatible with [HiveKeychain](https://hive-keychain.com/) and [@hiveio/dhive](https://www.npmjs.com/package/@hiveio/dhive).

### Placing a Prediction

Predictions require a paired **transfer** (the stake) and a **custom_json** (the prediction metadata), broadcast together in the same transaction.

```typescript
import { operations } from 'hivepredict';

const marketId = 'some-market-id';
const outcome = 'YES';
const amount = '10.000 HIVE';

// 1. Build the transfer memo
const transfer = operations.predictionTransfer('hivepredict', marketId, outcome, amount);

// 2. Build the custom_json operation
const customJson = operations.placePrediction('myusername', {
  market_id: marketId,
  outcome,
  amount: '10.000',
  tx_id: '', // filled by the blockchain after broadcast
});

// 3. Broadcast both in one transaction via HiveKeychain
window.hive_keychain.requestBroadcast(
  'myusername',
  [
    ['transfer', { from: 'myusername', to: transfer.to, amount: transfer.amount, memo: transfer.memo }],
    ['custom_json', customJson],
  ],
  'Active',
  callback,
);
```

### Creating a Market

```typescript
import { operations } from 'hivepredict';

const op = operations.createMarket('myusername', {
  market_id: crypto.randomUUID(),
  title: 'Will BTC reach $100k by end of 2026?',
  description: 'Resolves based on CoinGecko BTC/USD price.',
  category: 'crypto',
  token: 'HIVE',
  outcomes: ['YES', 'NO'],
  creator_side: 'YES',
  stake_cap: 10000,
  min_participants: 3,
  resolution_type: 'auto',
  resolution_source: 'coingecko:bitcoin:usd',
  resolution_criteria: 'Resolves YES if BTC >= $100,000 USD at resolution time.',
  betting_closes_at: '2026-12-30T00:00:00Z',
  resolves_at: '2026-12-31T00:00:00Z',
});

// Broadcast via HiveKeychain
window.hive_keychain.requestCustomJson(
  'myusername',
  op.id,
  'Posting',
  op.json,
  'Create Market',
  callback,
);
```

### Commenting on a Market

```typescript
import { operations } from 'hivepredict';

const op = operations.comment('myusername', {
  market_id: 'some-market-id',
  body: 'I think YES is undervalued here.',
});

// Broadcast via @hiveio/dhive
await client.broadcast.json(op, postingKey);
```

### All Operations

```typescript
import { operations } from 'hivepredict';

// Market operations
operations.createMarket(username, payload)
operations.placePrediction(username, payload)
operations.cashOut(username, payload)
operations.cancelMarket(username, marketId)

// Social
operations.comment(username, payload)
operations.submitProof(username, payload)
operations.voteProof(username, payload)

// Safety
operations.selfExclude(username, duration)       // '24h' | '7d' | '30d' | '90d' | '1y' | 'permanent'
operations.startCooldown(username, duration)      // '12h' | '24h' | '72h'
operations.setSafetyLimits(username, payload)

// Transfer helpers (for paired operations)
operations.predictionTransfer(platformAccount, marketId, outcome, amount)
operations.marketCreationTransfer(platformAccount, marketId, amount)

// Low-level builder
operations.buildCustomJson(username, operationId, payload)
```

## Error Handling

```typescript
import { HivePredict, HivePredictError, NetworkError } from 'hivepredict';

const hp = new HivePredict();

try {
  const market = await hp.markets.get('nonexistent');
} catch (error) {
  if (error instanceof HivePredictError) {
    console.error(error.message);        // "Market not found"
    console.error(error.statusCode);     // 404
    console.error(error.response);       // raw response body
  } else if (error instanceof NetworkError) {
    console.error(error.message);
    console.error(error.cause);
  }
}
```

## Types

All types are exported for use in your application:

```typescript
import type {
  Market,
  Prediction,
  Payout,
  User,
  UserStats,
  ActivityEvent,
  MarketComment,
  MarketProof,
  MarketSnapshot,
  Token,
  // Literal types
  MarketStatus,
  MarketCategory,
  PredictionStatus,
  PayoutType,
  ActivityEventType,
  // Query params
  MarketListParams,
  PaginationParams,
  // Response types
  MarketListResponse,
  UserProfileResponse,
  EligibilityResponse,
  PlatformStats,
  // Operation types
  CustomJsonOperation,
  TransferMemo,
  CreateMarketPayload,
  PlacePredictionPayload,
  // ... and more
} from 'hivepredict';
```

## License

MIT
