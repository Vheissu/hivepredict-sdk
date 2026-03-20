import { describe, it, expect } from 'vitest';
import { operations } from '../src/index.js';

describe('operations', () => {
  describe('buildCustomJson', () => {
    it('builds a valid custom_json operation', () => {
      const op = operations.buildCustomJson('alice', operations.OperationIds.COMMENT, {
        market_id: 'm1',
        body: 'Hello!',
      });

      expect(op.id).toBe('hivepredict_comment');
      expect(op.required_auths).toEqual([]);
      expect(op.required_posting_auths).toEqual(['alice']);
      expect(JSON.parse(op.json)).toEqual({ market_id: 'm1', body: 'Hello!' });
    });
  });

  describe('createMarket', () => {
    it('builds a create_market operation', () => {
      const op = operations.createMarket('alice', {
        market_id: 'test-id',
        title: 'Will it rain?',
        description: 'Resolves YES if rain.',
        category: 'other',
        token: 'HIVE',
        outcomes: ['YES', 'NO'],
        creator_side: 'YES',
        stake_cap: 1000,
        min_participants: 3,
        resolution_type: 'manual',
        resolution_source: null,
        resolution_criteria: 'Check weather.',
        betting_closes_at: '2026-12-31T00:00:00Z',
        resolves_at: '2026-12-31T12:00:00Z',
      });

      expect(op.id).toBe('hivepredict_create_market');
      expect(op.required_posting_auths).toEqual(['alice']);

      const payload = JSON.parse(op.json);
      expect(payload.market_id).toBe('test-id');
      expect(payload.title).toBe('Will it rain?');
      expect(payload.outcomes).toEqual(['YES', 'NO']);
    });
  });

  describe('placePrediction', () => {
    it('builds a place_prediction operation', () => {
      const op = operations.placePrediction('bob', {
        market_id: 'm1',
        outcome: 'YES',
        amount: '10.000',
        tx_id: 'abc123',
      });

      expect(op.id).toBe('hivepredict_place_prediction');
      const payload = JSON.parse(op.json);
      expect(payload.market_id).toBe('m1');
      expect(payload.outcome).toBe('YES');
      expect(payload.tx_id).toBe('abc123');
    });
  });

  describe('predictionTransfer', () => {
    it('builds the correct transfer memo', () => {
      const transfer = operations.predictionTransfer('hivepredict', 'm1', 'YES', '10.000 HIVE');
      expect(transfer.to).toBe('hivepredict');
      expect(transfer.amount).toBe('10.000 HIVE');
      expect(transfer.memo).toBe('m1:YES');
    });
  });

  describe('marketCreationTransfer', () => {
    it('builds the correct creation fee memo', () => {
      const transfer = operations.marketCreationTransfer('hivepredict', 'new-market', '5.000 HIVE');
      expect(transfer.to).toBe('hivepredict');
      expect(transfer.memo).toBe('create_market:new-market');
    });
  });

  describe('comment', () => {
    it('builds a comment operation', () => {
      const op = operations.comment('alice', { market_id: 'm1', body: 'Great market!' });
      expect(op.id).toBe('hivepredict_comment');
      const payload = JSON.parse(op.json);
      expect(payload.body).toBe('Great market!');
    });
  });

  describe('submitProof', () => {
    it('builds a submit_proof operation', () => {
      const op = operations.submitProof('alice', {
        market_id: 'm1',
        outcome: 'YES',
        note: 'It happened',
        source_urls: ['https://example.com/proof'],
      });
      expect(op.id).toBe('hivepredict_submit_market_proof');
      const payload = JSON.parse(op.json);
      expect(payload.source_urls).toEqual(['https://example.com/proof']);
    });
  });

  describe('voteProof', () => {
    it('builds a vote_proof operation', () => {
      const op = operations.voteProof('bob', { market_id: 'm1', proof_id: 'p1', vote: 'up' });
      expect(op.id).toBe('hivepredict_vote_market_proof');
      const payload = JSON.parse(op.json);
      expect(payload.vote).toBe('up');
    });
  });

  describe('cancelMarket', () => {
    it('builds a cancel_market operation', () => {
      const op = operations.cancelMarket('alice', 'm1');
      expect(op.id).toBe('hivepredict_cancel_market');
      expect(JSON.parse(op.json)).toEqual({ market_id: 'm1' });
    });
  });

  describe('selfExclude', () => {
    it('builds a self_exclude operation', () => {
      const op = operations.selfExclude('alice', '30d');
      expect(op.id).toBe('hivepredict_self_exclude_user');
      expect(JSON.parse(op.json)).toEqual({ duration: '30d' });
    });
  });

  describe('startCooldown', () => {
    it('builds a start_cooldown operation', () => {
      const op = operations.startCooldown('alice', '24h');
      expect(op.id).toBe('hivepredict_start_cooldown');
      expect(JSON.parse(op.json)).toEqual({ duration: '24h' });
    });
  });

  describe('setSafetyLimits', () => {
    it('builds a set_safety_limits operation', () => {
      const op = operations.setSafetyLimits('alice', {
        monthly_stake_cap_hive: 500,
        loss_streak_threshold: 5,
        loss_streak_cooldown_hours: 24,
      });
      expect(op.id).toBe('hivepredict_set_safety_limits');
      const payload = JSON.parse(op.json);
      expect(payload.monthly_stake_cap_hive).toBe(500);
    });
  });

  describe('cashOut', () => {
    it('builds a cash_out operation', () => {
      const op = operations.cashOut('bob', { market_id: 'm1', outcome: 'YES', amount: '5.000' });
      expect(op.id).toBe('hivepredict_cash_out_prediction');
      const payload = JSON.parse(op.json);
      expect(payload.amount).toBe('5.000');
    });
  });

  describe('OperationIds', () => {
    it('exports all public operation IDs', () => {
      expect(operations.OperationIds.CREATE_MARKET).toBe('hivepredict_create_market');
      expect(operations.OperationIds.PLACE_PREDICTION).toBe('hivepredict_place_prediction');
      expect(operations.OperationIds.CASH_OUT).toBe('hivepredict_cash_out_prediction');
      expect(operations.OperationIds.COMMENT).toBe('hivepredict_comment');
      expect(operations.OperationIds.SUBMIT_PROOF).toBe('hivepredict_submit_market_proof');
      expect(operations.OperationIds.VOTE_PROOF).toBe('hivepredict_vote_market_proof');
      expect(operations.OperationIds.CANCEL_MARKET).toBe('hivepredict_cancel_market');
      expect(operations.OperationIds.SELF_EXCLUDE).toBe('hivepredict_self_exclude_user');
      expect(operations.OperationIds.START_COOLDOWN).toBe('hivepredict_start_cooldown');
      expect(operations.OperationIds.SET_SAFETY_LIMITS).toBe('hivepredict_set_safety_limits');
    });
  });
});
