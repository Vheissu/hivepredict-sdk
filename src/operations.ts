// ---------------------------------------------------------------------------
// Hive custom_json operation IDs
// ---------------------------------------------------------------------------

export const OperationIds = {
  CREATE_MARKET: 'hivepredict_create_market',
  PLACE_PREDICTION: 'hivepredict_place_prediction',
  CASH_OUT: 'hivepredict_cash_out_prediction',
  COMMENT: 'hivepredict_comment',
  SUBMIT_PROOF: 'hivepredict_submit_market_proof',
  VOTE_PROOF: 'hivepredict_vote_market_proof',
  CANCEL_MARKET: 'hivepredict_cancel_market',
  SELF_EXCLUDE: 'hivepredict_self_exclude_user',
  START_COOLDOWN: 'hivepredict_start_cooldown',
  SET_SAFETY_LIMITS: 'hivepredict_set_safety_limits',
} as const;

export type OperationId = (typeof OperationIds)[keyof typeof OperationIds];

// ---------------------------------------------------------------------------
// Operation payload types
// ---------------------------------------------------------------------------

export interface CreateMarketPayload {
  market_id: string;
  title: string;
  description: string;
  category: string;
  token: string;
  opening_bet_amount?: string;
  outcomes: string[];
  outcome_labels?: Record<string, string> | null;
  creator_side: string;
  stake_cap: number;
  min_participants: number;
  resolution_type: 'auto' | 'manual';
  allow_early_resolution?: boolean;
  resolution_source: string | null;
  resolution_criteria: string;
  betting_closes_at: string;
  resolves_at: string;
  discussion_snap_permlink?: string | null;
}

export interface PlacePredictionPayload {
  market_id: string;
  outcome: string;
  amount: string;
  /** Transaction ID of the paired transfer to the platform account. */
  tx_id: string;
}

export interface CashOutPayload {
  market_id: string;
  outcome: string;
  amount: string;
}

export interface CommentPayload {
  market_id: string;
  body: string;
  parent_id?: string | null;
}

export interface SubmitProofPayload {
  market_id: string;
  outcome: string;
  note: string;
  source_url?: string;
  source_urls?: string[];
  outcome_known_at?: string;
}

export interface VoteProofPayload {
  market_id: string;
  proof_id: string;
  vote: 'up' | 'down';
}

export interface CancelMarketPayload {
  market_id: string;
}

export type SelfExclusionDuration = '24h' | '7d' | '30d' | '90d' | '1y' | 'permanent';

export interface SelfExcludePayload {
  duration: SelfExclusionDuration;
}

export type CooldownDuration = '12h' | '24h' | '72h';

export interface StartCooldownPayload {
  duration: CooldownDuration;
}

export interface SetSafetyLimitsPayload {
  monthly_stake_cap_hive?: number | null;
  monthly_stake_cap_hbd?: number | null;
  loss_streak_threshold?: number | null;
  loss_streak_cooldown_hours?: number | null;
}

// ---------------------------------------------------------------------------
// custom_json operation shape (compatible with @hiveio/dhive and HiveKeychain)
// ---------------------------------------------------------------------------

export interface CustomJsonOperation {
  id: string;
  required_auths: string[];
  required_posting_auths: string[];
  json: string;
}

// ---------------------------------------------------------------------------
// Transfer memo format for paired operations
// ---------------------------------------------------------------------------

export interface TransferMemo {
  /** Recipient (the HivePredict platform account). */
  to: string;
  /** Amount string, e.g. "10.000 HIVE". */
  amount: string;
  /** Memo that pairs this transfer with the custom_json. */
  memo: string;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Build a Hive `custom_json` operation ready for broadcasting.
 *
 * The returned object is compatible with both `@hiveio/dhive`
 * (`client.broadcast.json(op, key)`) and HiveKeychain
 * (`requestCustomJson(user, op.id, 'Posting', op.json, ...)`).
 */
export function buildCustomJson(
  username: string,
  operationId: OperationId,
  payload: Record<string, unknown>,
): CustomJsonOperation {
  return {
    id: operationId,
    required_auths: [],
    required_posting_auths: [username],
    json: JSON.stringify(payload),
  };
}

// ---------------------------------------------------------------------------
// Convenience builders
// ---------------------------------------------------------------------------

export function createMarket(username: string, payload: CreateMarketPayload): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.CREATE_MARKET, payload as unknown as Record<string, unknown>);
}

export function placePrediction(username: string, payload: PlacePredictionPayload): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.PLACE_PREDICTION, payload as unknown as Record<string, unknown>);
}

/**
 * Build the transfer memo for a prediction. Send this transfer in the same
 * transaction as the `placePrediction` custom_json.
 *
 * @param platformAccount - The HivePredict platform account (get from `hp.config()`).
 * @param marketId - The on-chain market ID.
 * @param outcome - The outcome being predicted (e.g. "YES").
 * @param amount - Amount string including token, e.g. "10.000 HIVE".
 */
export function predictionTransfer(
  platformAccount: string,
  marketId: string,
  outcome: string,
  amount: string,
): TransferMemo {
  return {
    to: platformAccount,
    amount,
    memo: `${marketId}:${outcome}`,
  };
}

/**
 * Build the transfer memo for a market creation fee. Send this transfer in the
 * same transaction as the `createMarket` custom_json.
 */
export function marketCreationTransfer(
  platformAccount: string,
  marketId: string,
  amount: string,
): TransferMemo {
  return {
    to: platformAccount,
    amount,
    memo: `create_market:${marketId}`,
  };
}

export function cashOut(username: string, payload: CashOutPayload): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.CASH_OUT, payload as unknown as Record<string, unknown>);
}

export function comment(username: string, payload: CommentPayload): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.COMMENT, payload as unknown as Record<string, unknown>);
}

export function submitProof(username: string, payload: SubmitProofPayload): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.SUBMIT_PROOF, payload as unknown as Record<string, unknown>);
}

export function voteProof(username: string, payload: VoteProofPayload): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.VOTE_PROOF, payload as unknown as Record<string, unknown>);
}

export function cancelMarket(username: string, marketId: string): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.CANCEL_MARKET, { market_id: marketId });
}

export function selfExclude(username: string, duration: SelfExclusionDuration): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.SELF_EXCLUDE, { duration });
}

export function startCooldown(username: string, duration: CooldownDuration): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.START_COOLDOWN, { duration });
}

export function setSafetyLimits(username: string, payload: SetSafetyLimitsPayload): CustomJsonOperation {
  return buildCustomJson(username, OperationIds.SET_SAFETY_LIMITS, payload as unknown as Record<string, unknown>);
}
