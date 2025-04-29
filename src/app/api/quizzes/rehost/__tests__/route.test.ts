/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { POST } from '../route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as dbConfig from '@/dbConfig/dbConfig';
import Quiz from '@/models/quizModel';
import Session from '@/models/sessionModel';
import UserNew from '@/models/userModel';
import jwt from 'jsonwebtoken';

// convince TS that Session is a jest.Mock
const SessionMock = Session as unknown as jest.Mock;

// ────────────────────────────────────────────────────────────────────────────────
// Mocks
// ────────────────────────────────────────────────────────────────────────────────
jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }));
jest.mock(
  '@/models/quizModel',
  () => ({ __esModule: true, default: { findById: jest.fn() } })
);
jest.mock('@/models/sessionModel', () => {
  // Make Session a jest.fn() so .mock.calls exists
  const m = jest.fn((data: any) => ({
    ...data,
    _id: 'NEW_SESSION_ID',
    join_code: 'JOIN123',
    save: jest.fn().mockResolvedValue(undefined),
  }));
  return { __esModule: true, default: m };
});
jest.mock(
  '@/models/userModel',
  () => ({ __esModule: true, default: { findByIdAndUpdate: jest.fn() } })
);
jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));

// ────────────────────────────────────────────────────────────────────────────────
// Monkey-patch NextResponse.json so we can inspect status & body
// ────────────────────────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────────
describe('POST /api/quizzes/rehost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dbConfig.connect as jest.Mock).mockResolvedValue(undefined);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'USER123' });
  });

  function makeReq(body: any, token?: string): NextRequest {
    return {
      json: async () => body,
      cookies: {
        get: (name: string) =>
          name === 'authToken' && token ? { value: token } : undefined,
      },
    } as any as NextRequest;
  }

  it('201 happy path: creates session & updates user', async () => {
    // 1) stub Quiz.findById and UserNew.findByIdAndUpdate
    (Quiz.findById as jest.Mock).mockResolvedValue({ _id: 'Q1', duration: 20 });
    (UserNew.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'USER123',
      hosted_quizzes: ['Q1'],
    });

    // 2) call POST handler
    const req = makeReq({ quizId: 'Q1', duration: 15 }, 'tok');
    const res = await POST(req);

    // 3) verify connect, token decode, quiz lookup
    expect(dbConfig.connect).toHaveBeenCalled();
    expect(jwt.verify).toHaveBeenCalledWith('tok', process.env.JWT_SECRET!);
    expect(Quiz.findById).toHaveBeenCalledWith('Q1');

    // 4) verify Session was constructed with the right fields
    expect(SessionMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        quiz_id: 'Q1',
        is_active: true,
        start_time: expect.any(Date),
        end_time: expect.any(Date),
      })
    );

    // 5) grab the instance returned by our mock constructor and check .save()
    const sessionInstance = SessionMock.mock.results[0].value as any;
    expect(sessionInstance.save).toHaveBeenCalled();

    // 6) verify user update
    expect(UserNew.findByIdAndUpdate).toHaveBeenCalledWith(
      'USER123',
      { $addToSet: { hosted_quizzes: 'Q1' } },
      { new: true }
    );

    // 7) verify response
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      success: true,
      sessionId: 'NEW_SESSION_ID',
      join_code: 'JOIN123',
      message: 'New session created successfully',
    });
  });

  // you can add more tests for 400, 401, 404, 500 here as needed
});
