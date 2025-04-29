/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { POST } from '../route';
import * as dbConfig from '@/dbConfig/dbConfig';
import mongoose from 'mongoose';
import Answer from '@/models/answerModel';
import Question from '@/models/questionModel';
import PlayerQuiz from '@/models/playerQuizModel';
import UserNew from '@/models/userModel';
import type { NextRequest } from 'next/server';

// ————————————————————————————————————————————————————— mocks —————————————————————————————————————————————————————
// stub out connect() (called at module load, not inside POST)
jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }));

// manual‐mock Answer model
jest.mock('@/models/answerModel', () => {
  const m: any = jest.fn();
  m.insertMany = jest.fn();
  m.aggregate   = jest.fn();
  return { __esModule: true, default: m };
});

// manual‐mock Question model
jest.mock('@/models/questionModel', () => {
  const m: any = jest.fn();
  m.findById = jest.fn();
  return { __esModule: true, default: m };
});

// manual‐mock PlayerQuiz model
jest.mock('@/models/playerQuizModel', () => {
  const m: any = jest.fn();
  m.findById = jest.fn();
  return { __esModule: true, default: m };
});

// manual‐mock UserNew model
jest.mock('@/models/userModel', () => {
  const m: any = jest.fn();
  m.findById = jest.fn();
  return { __esModule: true, default: m };
});
// ——————————————————————————————————————————————————————————————————————————————————————

describe('POST /api/quizzes/complete', () => {
  // freeze time so completed_at is predictable
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Note: connect() was already called at import time
    (dbConfig.connect as jest.Mock).mockResolvedValue(undefined);
  });

  function makeReq(body: any): NextRequest {
    return { json: async () => body } as any;
  }

  it('400 if player_quiz_id or answers missing', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Player quiz Id and answers are required'
    });
  });

  it('404 if player quiz not found', async () => {
    (PlayerQuiz.findById as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeReq({
      player_quiz_id: '507f1f77bcf86cd799439011',
      answers: [{ question_id: '507f1f77bcf86cd799439012', submitted_answer: 'foo' }]
    }));

    expect(PlayerQuiz.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Player quiz not found' });
  });

  it('500 if question lookup fails', async () => {
    (PlayerQuiz.findById as jest.Mock).mockResolvedValue({
      player_id:  'u1',
      session_id: 's1',
      score:      0,
      save:       jest.fn()
    });
    (Question.findById as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeReq({
      player_quiz_id: '507f1f77bcf86cd799439011',
      answers: [{ question_id: '507f1f77bcf86cd799439012', submitted_answer: 'foo' }]
    }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });

  it('200 happy path: processes answers, updates quiz & user', async () => {
    // 1) stub playerQuiz
    const playerQuiz: any = {
      player_id:  'user1',
      session_id: 'sess1',
      score:      0,
      save:       jest.fn().mockResolvedValue(undefined)
    };
    (PlayerQuiz.findById as jest.Mock).mockResolvedValue(playerQuiz);

    // 2) stub two questions
    (Question.findById as jest.Mock)
      .mockResolvedValueOnce({ question_type: 'MCQ',     correct_answer: 'Yes',       points: 3 })
      .mockResolvedValueOnce({ question_type: 'Ranking', correct_answer: ['A','B'], points: 2 });

    // 3) capture docs passed to insertMany
    const inserted: any[] = [];
    (Answer.insertMany as jest.Mock).mockImplementation(docs => {
      inserted.push(...docs);
      return Promise.resolve(docs);
    });

    // 4) stub the aggregate to return total 5
    (Answer.aggregate as jest.Mock).mockResolvedValue([{ total: 5 }]);

    // 5) stub user lookup & save
    const user: any = { total_points: 10, save: jest.fn().mockResolvedValue(undefined) };
    (UserNew.findById as jest.Mock).mockResolvedValue(user);

    // invoke handler
    const res = await POST(makeReq({
      player_quiz_id: '507f1f77bcf86cd799439011',
      answers: [
        { question_id: '507f1f77bcf86cd799439012', submitted_answer: 'yes'  },
        { question_id: '507f1f77bcf86cd799439013', submitted_answer: ['A','B'] }
      ]
    }));

    // question lookups
    expect(Question.findById).toHaveBeenCalledTimes(2);

    // insertMany shape
    expect(Answer.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          player_quiz_id:  expect.any(mongoose.Types.ObjectId),
          question_id:     expect.any(mongoose.Types.ObjectId),
          submitted_answer: 'yes',
          is_correct:       true,
          points:           3
        }),
        expect.objectContaining({
          submitted_answer: ['A','B'],
          is_correct:       true,
          points:           2
        })
      ])
    );

    // aggregation pipeline
    expect(Answer.aggregate).toHaveBeenCalledWith([
      { $match: { player_quiz_id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    // quiz updated & saved
    expect(playerQuiz.score).toBe(5);
    expect(playerQuiz.completed_at).toEqual(new Date('2025-01-01T00:00:00Z'));
    expect(playerQuiz.save).toHaveBeenCalled();

    // user bumped from 10→15
    expect(user.total_points).toBe(15);
    expect(user.save).toHaveBeenCalled();

    // final JSON response
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      success:      true,
      session_id:  'sess1',
      score:        5,
      completed_at: new Date('2025-01-01T00:00:00Z')
    });
  });
});
