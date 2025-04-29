/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { GET } from '../route';
import * as dbConfig from '@/dbConfig/dbConfig';
import Session from '@/models/sessionModel';
import PlayerQuiz from '@/models/playerQuizModel';
import type { NextRequest } from 'next/server';

// ————————————————————————————————————————————————————— mocks —————————————————————————————————————————————————————
// stub out connect()
jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }));

// manual‐mock Session model (to support .populate(...))
jest.mock('@/models/sessionModel', () => {
  const m: any = jest.fn();
  m.findOne = jest.fn();
  return { __esModule: true, default: m };
});

// manual‐mock PlayerQuiz model
jest.mock('@/models/playerQuizModel', () => {
  const m: any = jest.fn();
  m.findOne = jest.fn();
  m.prototype.save = jest.fn();
  return { __esModule: true, default: m };
});
// ——————————————————————————————————————————————————————————————————————————————————————

describe('GET /api/quizzes/join/[joinCode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // by default, connect() succeeds
    (dbConfig.connect as jest.Mock).mockResolvedValue(undefined);
  });

  function makeReq(path: string, userId?: string): NextRequest {
    return {
      nextUrl: { pathname: path },
      headers: {
        get: jest.fn().mockImplementation((k: string) => k === 'x-user-id' ? userId : null)
      }
    } as any;
  }

  it('400 if no join code in URL', async () => {
    const res = await GET(makeReq('/api/quizzes/join/'));
    expect(dbConfig.connect).toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Join Code is required' });
  });

  it('404 if session not found', async () => {
    // Session.findOne().populate(...) → null
    (Session.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });

    const res = await GET(makeReq('/api/quizzes/join/ABC123', 'u1'));
    expect(dbConfig.connect).toHaveBeenCalled();
    expect(Session.findOne).toHaveBeenCalledWith({ join_code: 'ABC123' });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Invalid join code' });
  });

  it('400 if session expired and flips is_active off', async () => {
    const fakeSession: any = {
      _id: 's1',
      quiz_id: { _id: 'q1' },
      end_time: new Date(Date.now() - 1000), // already over
      is_active: true,
      save: jest.fn()
    };
    (Session.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(fakeSession)
    });

    const res = await GET(makeReq('/api/quizzes/join/ABC123', 'u1'));
    expect(fakeSession.is_active).toBe(false);
    expect(fakeSession.save).toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Session expired' });
  });

  it('401 if user header missing', async () => {
    const fakeSession: any = {
      _id: 's1',
      quiz_id: { _id: 'q1' },
      end_time: null,
      is_active: true
    };
    (Session.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(fakeSession)
    });

    const res = await GET(makeReq('/api/quizzes/join/ABC123'));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'User authentication required' });
  });

  it('400 if player already joined', async () => {
    const fakeSession: any = {
      _id: 's1',
      quiz_id: { _id: 'q1' },
      end_time: null,
      is_active: true
    };
    (Session.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(fakeSession)
    });
    (PlayerQuiz.findOne as jest.Mock).mockResolvedValue({ _id: 'pq1' });

    const res = await GET(makeReq('/api/quizzes/join/ABC123', 'user42'));
    expect(PlayerQuiz.findOne).toHaveBeenCalledWith({
      session_id: 's1',
      player_id: 'user42'
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Player already joined this session' });
  });

  it('200 happy path: creates a new PlayerQuiz', async () => {
    const fakeSession: any = {
      _id: 's1',
      quiz_id: { _id: 'q1' },
      end_time: null,
      is_active: true
    };
    (Session.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(fakeSession)
    });
    (PlayerQuiz.findOne as jest.Mock).mockResolvedValue(null);

    // capture the new instance
    let created: any = null;
    (PlayerQuiz as any).mockImplementation(function(this: any, doc: any) {
      created = { ...doc, save: jest.fn().mockResolvedValue(undefined), _id: 'newPQ' };
      return created;
    });

    const res = await GET(makeReq('/api/quizzes/join/ABC123', 'user42'));
    expect((PlayerQuiz as any).mock.calls[0][0]).toEqual({
      session_id: 's1',
      quiz_id: 'q1',
      player_id: 'user42',
      score: 0
    });
    expect(created.save).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      session_id: 's1',
      player_quiz_id: 'newPQ'
    });
  });

  it('500 if connect() throws', async () => {
    (dbConfig.connect as jest.Mock).mockRejectedValue(new Error('db down'));
    const res = await GET(makeReq('/api/quizzes/join/ABC123', 'u1'));
    expect(dbConfig.connect).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
