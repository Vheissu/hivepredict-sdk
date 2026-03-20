// ---------------------------------------------------------------------------
// Enums / Literal Types
// ---------------------------------------------------------------------------

export type MarketStatus =
  | 'pending'
  | 'active'
  | 'locked'
  | 'resolved'
  | 'voided'
  | 'cancelled'
  | 'suspended';

export type MarketCategory = 'crypto' | 'hive' | 'sports' | 'tech' | 'other';

export type ResolutionType = 'auto' | 'manual';

export type PredictionStatus =
  | 'active'
  | 'cashed_out'
  | 'won'
  | 'lost'
  | 'refunded'
  | 'voided';

export type PayoutType =
  | 'winnings'
  | 'cashout'
  | 'creator_bonus'
  | 'platform_fee'
  | 'burn'
  | 'loss_notification'
  | 'refund';

export type PayoutStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'confirmed'
  | 'failed';

export type ActivityEventType =
  | 'market_created'
  | 'bet_placed'
  | 'cashout_executed'
  | 'refund_issued'
  | 'market_refunded'
  | 'market_resolved'
  | 'comment_posted';

export type AdminActionType =
  | 'resolve_market'
  | 'void_market'
  | 'reject_market'
  | 'request_more_proof'
  | 'suspend_market'
  | 'unsuspend_market'
  | 'suspend_user'
  | 'unsuspend_user'
  | 'update_config'
  | 'monthly_report_posted';

export type AdminTargetType = 'market' | 'user' | 'config';

export type ProofType = 'creator' | 'bettor' | 'admin';

export type EligibilityAction = 'predict' | 'create_market';

export type MarketSort = 'newest' | 'ending_soon' | 'most_volume' | 'trending';

export type MarketGroup = 'core' | 'he' | 'all';

export type SnapshotRange = '1d' | '1w' | '1m' | 'all';

// ---------------------------------------------------------------------------
// Embedded Objects
// ---------------------------------------------------------------------------

export interface CreatorProof {
  outcome: string;
  note: string;
  sourceUrl?: string;
  sourceUrls?: string[];
  outcomeKnownAt?: string;
  submittedBy: string;
  submittedAt: string;
  txId: string;
}

export interface ProofRequest {
  reason: string;
  requestedBy: string;
  requestedAt: string;
  txId: string;
}

// ---------------------------------------------------------------------------
// Core Models
// ---------------------------------------------------------------------------

export interface Market {
  /** On-chain market ID (public identifier) */
  id: string;
  /** Same as `id` — the on-chain identifier */
  onChainId: string;
  creatorUsername: string;
  creatorSide: string;
  title: string;
  description: string;
  category: MarketCategory;
  token: string;
  outcomes: string[];
  outcomeLabels: Record<string, string> | null;
  stakeCap: string;
  minParticipants: number;
  creationFeeAmount: string | null;
  creationFeeToken: string | null;
  creationFeeTxId: string | null;
  bettingClosesAt: string;
  resolvesAt: string;
  resolutionType: ResolutionType;
  allowEarlyResolution: boolean;
  resolutionSource: string | null;
  resolutionCriteria: string | null;
  discussionSnapPermlink: string | null;
  creatorProof: CreatorProof | null;
  proofRequest: ProofRequest | null;
  status: MarketStatus;
  statusBeforeSuspension: MarketStatus | null;
  suspendedAt: string | null;
  suspendedReason: string | null;
  resolvedOutcome: string | null;
  resolvedAt: string | null;
  resolvedTxId: string | null;
  totalPool: string;
  createdAt: string;
  updatedAt: string;
  /** Total YES-side pool */
  yesPool: string;
  /** Total NO-side pool */
  noPool: string;
  /** Pool totals keyed by outcome */
  outcomePools: Record<string, string>;
  /** ISO timestamp — late-entry trading cutoff */
  tradingCutoff: string;
  /** Unique active participants (detail endpoint only) */
  participantCount?: number;
}

export interface Prediction {
  id: string;
  marketId: string;
  hiveUsername: string;
  outcome: string;
  amount: string;
  remainingAmount: string;
  cashedOutAmount: string;
  token: string;
  txId: string;
  status: PredictionStatus;
  payoutAmount: string | null;
  payoutTxId: string | null;
  isCreator: boolean;
  timeFraction: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  marketId: string | null;
  hiveUsername: string;
  sourceTxId: string;
  type: PayoutType;
  amount: string;
  token: string;
  txId: string | null;
  status: PayoutStatus;
  meta: Record<string, unknown> | null;
  createdAt: string;
  confirmedAt: string | null;
}

export interface User {
  id: string;
  hiveUsername: string;
  profileImageUrl: string | null;
  accountCreated: string | null;
  reputation: string | null;
  isEligible: boolean;
  totalMarketsCreated: number;
  totalPredictions: number;
  totalWins: number;
  winRate: string | null;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  selfExclusionType: string;
  selfExcludedAt: string | null;
  selfExcludedUntil: string | null;
  selfExclusionSource: string;
  cooldownStartedAt: string | null;
  cooldownUntil: string | null;
  cooldownReason: string | null;
  cooldownSource: string;
  lossStreakThreshold: number | null;
  lossStreakCooldownHours: number | null;
  monthlyStakeLimitHive: string | null;
  monthlyStakeLimitHbd: string | null;
  safetyLimitsSetAt: string | null;
  safetyLimitsLockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalMarketsCreated: number;
  totalPredictions: number;
  totalWins: number;
  winRate: string;
  totalEarnings: string;
  totalStaked: string;
}

export interface ActivityEvent {
  id: string;
  eventType: ActivityEventType;
  marketId: string | null;
  marketOnChainId: string;
  marketTitle: string | null;
  account: string;
  amount: string | null;
  token: string | null;
  outcome: string | null;
  resolvedOutcome: string | null;
  txId: string;
  blockNum: number;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export interface MarketComment {
  id: string;
  marketId: string;
  marketOnChainId: string;
  hiveUsername: string;
  body: string;
  parentId: string | null;
  txId: string;
  blockNum: number;
  createdAt: string;
}

export interface MarketProof {
  id: string;
  marketId: string;
  marketOnChainId: string;
  hiveUsername: string;
  proofType: ProofType;
  claimedOutcome: string;
  note: string;
  sourceUrl: string | null;
  sourceUrls: string[];
  outcomeKnownAt: string | null;
  txId: string;
  blockNum: number;
  createdAt: string;
  voteScore: number;
  upvotes: number;
  downvotes: number;
  myVote: number;
}

export interface MarketSnapshot {
  id: string;
  marketId: string;
  snapshotAt: string;
  totalPool: string;
  outcomePools: Record<string, string>;
  participantCount: number;
}

export interface AdminAction {
  id: string;
  actionType: AdminActionType;
  performedBy: string;
  targetType: AdminTargetType;
  targetId: string;
  reason: string | null;
  txId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface SafetyEvent {
  id: string;
  hiveUsername: string;
  eventType: string;
  value: Record<string, unknown>;
  effectiveAt: string;
  expiresAt: string | null;
  txId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Token & Category
// ---------------------------------------------------------------------------

export interface Token {
  symbol: string;
  name: string;
  issuer: string | null;
  precision: number;
  icon: string | null;
  url: string | null;
  volume24h: string | null;
  lastPrice: string | null;
  isNative: boolean;
}

export interface Category {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Query Parameter Types
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface MarketListParams extends PaginationParams {
  status?: MarketStatus;
  includePending?: boolean;
  category?: MarketCategory;
  token?: string;
  marketGroup?: MarketGroup;
  sort?: MarketSort;
}

export interface MarketFeedParams extends PaginationParams {
  category?: MarketCategory;
  token?: string;
  marketGroup?: MarketGroup;
}

export interface MarketSnapshotParams {
  range?: SnapshotRange;
}

export interface MarketProofParams extends PaginationParams {
  username?: string;
}

export interface ActivityListParams extends PaginationParams {
  types?: ActivityEventType[];
  marketId?: string;
  account?: string;
}

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export interface MarketListResponse {
  markets: Market[];
  total: number;
  page: number;
  limit: number;
}

export interface PredictionListResponse {
  predictions: Prediction[];
  total: number;
  page: number;
  limit: number;
}

export interface PayoutListResponse {
  payouts: Payout[];
  total: number;
  page: number;
  limit: number;
}

export interface MarketSnapshotsResponse {
  snapshots: MarketSnapshot[];
}

export interface CommentListResponse {
  comments: MarketComment[];
  total: number;
  page: number;
  limit: number;
}

export interface ProofListResponse {
  proofs: MarketProof[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminActionsResponse {
  actions: AdminAction[];
}

export interface MarketStakeResponse {
  username: string;
  totalStake: string;
  byOutcome: Record<string, string>;
}

export interface UserProfileResponse {
  user: User;
  stats: UserStats;
}

export interface EligibilityResponse {
  eligible: boolean;
  reasons: string[];
  accountCreated: string | null;
  accountAgeDays: number;
  reputation: number;
  postCount: number;
  thresholds: {
    minAccountAgeDays: number;
    minReputation: number;
    minPosts: number;
  };
}

export interface UserSafetyResponse {
  username: string;
  safety: {
    isSelfExcluded: boolean;
    selfExclusionType: string;
    selfExcludedAt: string | null;
    selfExcludedUntil: string | null;
    selfExclusionSource: string;
    isCoolingOff: boolean;
    cooldownStartedAt: string | null;
    cooldownUntil: string | null;
    cooldownReason: string | null;
    cooldownSource: string;
    lossStreakThreshold: number | null;
    lossStreakCooldownHours: number | null;
    consecutiveLosses: number;
  };
  limits: {
    monthKey: string;
    monthlyStakeLimitHive: string | null;
    monthlyStakeLimitHbd: string | null;
    spentThisMonthHive: string;
    spentThisMonthHbd: string;
    remainingThisMonthHive: string | null;
    remainingThisMonthHbd: string | null;
    limitsSetAt: string | null;
    limitsLockedUntil: string | null;
    canIncreaseOrRemove: boolean;
  };
  events: SafetyEvent[];
}

export interface MarketFeaturedResponse {
  markets: Market[];
}

export interface PlatformStats {
  totalMarkets: number;
  activeMarkets: number | string;
  totalVolume: string;
  totalPredictions: number;
  totalUsers: number;
  totalPayoutsDistributed: string;
}

export interface PlatformConfig {
  hivePlatformAccount: string;
  hiveBurnAccount: string;
  burnFeeRate: number;
  marketCreationFee: number;
  creatorOpeningBetMin: number;
  creatorOpeningBetRequiredFrom: string;
  hiveEngineCustomJsonId: string;
  adminAccounts: string[];
}

export interface TokenListResponse {
  tokens: Token[];
}

export interface TokenBalanceResponse {
  account: string;
  symbol: string;
  balance: string;
  source: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ActivityFeedResponse {
  events: ActivityEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface PublicApiResponse {
  name: string;
  readOnly: boolean;
  methods: string[];
  endpoints: Array<{
    method: string;
    path: string;
    description: string;
    query?: string[];
  }>;
  notes: string[];
}
