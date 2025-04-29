/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { GET } from '../route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as dbConfig from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Session from '@/models/sessionModel';
import PlayerQuiz from '@/models/playerQuizModel';
import AnswerNew from '@/models/answerModel';

// ─── Mocks ────────────────────────────────────────────────────────────────
jest.mock('@/dbConfig/dbConfig',      () => ({ connect: jest.fn() }));
jest.mock('jsonwebtoken',             () => ({ verify: jest.fn() }));
jest.mock('@/models/sessionModel',    () => ({ __esModule: true, default: { findById: jest.fn() } }));
jest.mock('@/models/playerQuizModel', () => ({ __esModule: true, default: { findOne: jest.fn() } }));
jest.mock('@/models/answerModel',     () => ({ __esModule: true, default: { find: jest.fn() } }));

// ─── Capture NextResponse.json ────────────────────────────────────────────
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

describe('GET /api/quizzes/results/[sessionId]', () => {
  const connectMock    = dbConfig.connect as jest.Mock;
  const verifyMock     = (jwt.verify as jest.Mock);
  const findSession    = (Session.findById as jest.Mock);
  const findPlayerQuiz = (PlayerQuiz.findOne as jest.Mock);
  const findAnswers    = (AnswerNew.find as jest.Mock);

  beforeEach(() => {
    jest.clearAllMocks();
    connectMock.mockResolvedValue(undefined);
    verifyMock.mockReturnValue({ id: 'USER1' });
  });

  function makeReq(path: string, token?: string): NextRequest {
    return ({
      cookies: {
        get: (name: string) =>
          name === 'authToken' && token ? { value: token } : undefined,
      },
      nextUrl: { pathname: path },
    } as any) as NextRequest;
  }

  it('401 when no authToken cookie', async () => {
    const res = await GET(makeReq('/api/quizzes/results/S1'));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized access' });
  });

  it('500 when jwt.verify throws, then 401 when verify returns no id', async () => {
    // verify() throws → caught by catch → 500 + generic error
    verifyMock.mockImplementation(() => { throw new Error('bad'); });
    let res = await GET(makeReq('/api/quizzes/results/S1', 'tok'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });

    // verify() returns object without .id → explicit 401
    verifyMock.mockReturnValue({ foo: 'bar' });
    res = await GET(makeReq('/api/quizzes/results/S1', 'tok'));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid token' });
  });

  it('400 when sessionId segment missing', async () => {
    const res = await GET(makeReq('/api/quizzes/results/', 'tok'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Session ID is required' });
  });

  it('404 when Session.findById returns null', async () => {
    findSession.mockResolvedValue(null);
    const res = await GET(makeReq('/api/quizzes/results/S1', 'tok'));
    expect(findSession).toHaveBeenCalledWith('S1');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Session not found' });
  });

  it('404 when no PlayerQuiz for user & session', async () => {
    findSession.mockResolvedValue({});
    findPlayerQuiz.mockResolvedValue(null);
    const res = await GET(makeReq('/api/quizzes/results/S1', 'tok'));
    expect(findPlayerQuiz).toHaveBeenCalledWith({
      session_id: 'S1',
      player_id: 'USER1',
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: 'No quiz results found for this user in this session',
    });
  });

  it('404 when AnswerNew.find returns empty array', async () => {
    findSession.mockResolvedValue({});
    findPlayerQuiz.mockResolvedValue({ _id: 'PQ1' });
    const chain = { populate: jest.fn().mockResolvedValue([]) };
    findAnswers.mockReturnValue(chain as any);

    const res = await GET(makeReq('/api/quizzes/results/S1', 'tok'));
    expect(findAnswers).toHaveBeenCalledWith({ player_quiz_id: 'PQ1' });
    expect(chain.populate).toHaveBeenCalledWith({
      path: 'question_id',
      select: 'question_text options correct_answer question_type media_url',
      model: expect.any(Function),
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: 'No answers found for this session',
    });
  });

  it('200 happy path: trims media_url & leaves completed_at as Date', async () => {
    // session stub
    const fakeEnd = new Date('2025-01-01T00:00:00Z');
    findSession.mockResolvedValue({ end_time: fakeEnd });

    // playerQuiz stub
    const fakeComplete = new Date('2025-02-02T12:34:56Z');
    findPlayerQuiz.mockResolvedValue({
      _id: 'PQ1',
      quiz_id: 'QZ1',
      player_id: 'USER1',
      displayName: 'Alice',
      score: 99,
      completed_at: fakeComplete,
    });

    // answers stub
    const answersArray = [{
      question_id: {
        question_text: 'Q?',
        options: ['X','Y'],
        correct_answer: 'X',
        question_type: 'mcq',
        media_url: '  img.png  ',
      },
      submitted_answer: ['Y'],
      is_correct: false,
      points: 0,
    }];
    const chain = { populate: jest.fn().mockResolvedValue(answersArray) };
    findAnswers.mockReturnValue(chain as any);

    const res = await GET(makeReq('/api/quizzes/results/S1', 'tok'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({
      success: true,
      sessionId: 'S1',
      result: {
        playerQuizId: 'PQ1',
        quiz_id: 'QZ1',
        player_id: 'USER1',
        displayName: 'Alice',
        score: 99,
        completed_at: fakeComplete,
        end_time: '2025-01-01T00:00:00.000Z',
        answers: [{
          question_text: 'Q?',
          options: ['X','Y'],
          correct_answer: 'X',
          submitted_answer: ['Y'],
          is_correct: false,
          points: 0,
          question_type: 'mcq',
          image_url: 'img.png',
        }],
      },
    });

    // ensure we trimmed and populated
    expect(chain.populate).toHaveBeenCalledWith({
      path: 'question_id',
      select: 'question_text options correct_answer question_type media_url',
      model: expect.any(Function),
    });
  });
});
