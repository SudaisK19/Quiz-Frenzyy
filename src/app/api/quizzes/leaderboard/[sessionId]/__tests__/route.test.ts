/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { GET } from '../route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as dbConfig from '@/dbConfig/dbConfig';
import PlayerQuizNew from '@/models/playerQuizModel';
import Answer from '@/models/answerModel';

jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }));
jest.mock('@/models/playerQuizModel', () => {
  const m: any = {};
  m.find = jest.fn();
  return { __esModule: true, default: m };
});
jest.mock('@/models/answerModel', () => {
  const m: any = {};
  m.countDocuments = jest.fn();
  return { __esModule: true, default: m };
});

// ————————————————————————————
// Monkey-patch NextResponse.json
// ————————————————————————————
beforeAll(() => {
  jest
    .spyOn(NextResponse, 'json')
    .mockImplementation((body, init) => ({
      status: init?.status,
      headers: init?.headers,
      json: async () => body,
    } as any));
});
afterAll(() => {
  (NextResponse.json as jest.Mock).mockRestore();
});

describe('GET /api/quizzes/leaderboard/[sessionId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dbConfig.connect as jest.Mock).mockResolvedValue(undefined);
  });

  function makeReq(
    sessionId?: string
  ): [NextRequest, { params: Promise<{ sessionId: string }> }] {
    return [
      {} as NextRequest,
      { params: Promise.resolve({ sessionId: sessionId ?? '' }) },
    ];
  }

  it('returns 400 when sessionId is empty', async () => {
    const [req, ctx] = makeReq('');
    const res = await GET(req, ctx);
    expect(dbConfig.connect).toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'session id is required' });
  });

  it('returns 500 if connect() throws', async () => {
    (dbConfig.connect as jest.Mock).mockRejectedValueOnce(new Error('db fail'));
    const [req, ctx] = makeReq('S1');
    const res = await GET(req, ctx);
    expect(dbConfig.connect).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });

  it('200 happy path: sorts by score, attempted, then completed_at, and sets no-store header', async () => {
    // 1) fake PlayerQuiz docs
    const fakePlayers = [
      {
        _id: 'p1',
        player_id: { username: 'alice' },
        displayName: 'Alice',
        avatar: 'A.png',
        score: 10,
        completed_at: new Date('2025-01-01T00:00:00Z'),
      },
      {
        _id: 'p2',
        player_id: { username: 'bob' },
        displayName: 'Bob',
        avatar: 'B.png',
        score: 10,
        completed_at: new Date('2025-01-02T00:00:00Z'),
      },
      {
        _id: 'p3',
        player_id: { username: 'eve' },
        displayName: 'Eve',
        avatar: 'E.png',
        score: 8,
        completed_at: new Date('2025-01-01T00:00:00Z'),
      },
    ];

    // 2) stub the mongoose chain
    const chain = {
      populate: jest.fn().mockReturnThis(),
      sort:     jest.fn().mockReturnThis(),
      select:   jest.fn().mockResolvedValue(fakePlayers),
    };
    (PlayerQuizNew.find as jest.Mock).mockReturnValue(chain);

    // 3) stub counts
    const counts: Record<string, { attempted: number; correct: number }> = {
      p1: { attempted: 5, correct: 3 },
      p2: { attempted: 6, correct: 4 },
      p3: { attempted: 2, correct: 2 },
    };
    (Answer.countDocuments as jest.Mock).mockImplementation(
      (filter: { player_quiz_id: string; is_correct?: boolean }) =>
        Promise.resolve(
          filter.is_correct
            ? counts[filter.player_quiz_id].correct
            : counts[filter.player_quiz_id].attempted
        )
    );

    // 4) call handler
    const [req, ctx] = makeReq('SESSION123');
    const res = await GET(req, ctx);

    // 5) verify query chain
    expect(dbConfig.connect).toHaveBeenCalled();
    expect(PlayerQuizNew.find).toHaveBeenCalledWith({ session_id: 'SESSION123' });
    expect(chain.populate).toHaveBeenCalledWith('player_id', 'username');
    expect(chain.sort).toHaveBeenCalledWith({ score: -1, completed_at: 1 });
    expect(chain.select).toHaveBeenCalledWith(
      '_id player_id score completed_at displayName avatar'
    );

    // 6) check status, headers and body
    expect(res.status).toBe(200);
    expect((res.headers as any)['Cache-Control']).toBe('no-store');

    const body = await res.json();
    expect(body).toEqual({
      success: true,
      leaderboard: [
        {
          _id: 'p2',
          displayName: 'Bob',
          avatar: 'B.png',
          originalUsername: 'bob',
          score: 10,
          // ← now a Date, matching your route
          completed_at: new Date('2025-01-02T00:00:00Z'),
          attempted: 6,
          correct: 4,
        },
        {
          _id: 'p1',
          displayName: 'Alice',
          avatar: 'A.png',
          originalUsername: 'alice',
          score: 10,
          completed_at: new Date('2025-01-01T00:00:00Z'),
          attempted: 5,
          correct: 3,
        },
        {
          _id: 'p3',
          displayName: 'Eve',
          avatar: 'E.png',
          originalUsername: 'eve',
          score: 8,
          completed_at: new Date('2025-01-01T00:00:00Z'),
          attempted: 2,
          correct: 2,
        },
      ],
    });
  });
});
