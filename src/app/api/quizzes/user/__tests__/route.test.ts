import { GET } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import * as dbConfig from '@/dbConfig/dbConfig';
import UserNew from '@/models/userModel';
import PlayerQuiz from '@/models/playerQuizModel';
import jwt from 'jsonwebtoken';

// Mocks
jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }));
jest.mock('@/models/userModel', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));
jest.mock('@/models/playerQuizModel', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));
jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));

// Stub NextResponse.json for assertions
beforeAll(() => {
  jest
    .spyOn(NextResponse, 'json')
    .mockImplementation((body, init) => ({
      status: init?.status,
      headers: init?.headers,
      json: async () => body,
    }) as any);
});
afterAll(() => {
  (NextResponse.json as jest.Mock).mockRestore();
});

describe('GET /api/user/quizzes', () => {
  const connectMock = dbConfig.connect as jest.Mock;
  const findByIdMock = (UserNew.findById as jest.Mock);
  const findPQMock = (PlayerQuiz.find as jest.Mock);
  const verifyMock = (jwt.verify as jest.Mock);

  function makeReq(token?: string): NextRequest {
    return {
      cookies: { get: jest.fn().mockReturnValue(token ? { value: token } : undefined) }
    } as any;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    connectMock.mockResolvedValue(undefined);
  });

  it('401 when no token', async () => {
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized access' });
  });

  it('401 when invalid token', async () => {
    const token = 'bad-token';
    const req = makeReq(token);

    // Instead of throwing, return a decoded object with no `id`
    verifyMock.mockReturnValue({});

    const res = await GET(req);
    expect(verifyMock).toHaveBeenCalledWith(token, process.env.JWT_SECRET!);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'invalid token' });
  });

  it('404 when user not found', async () => {
    const token = 'tok';
    const req = makeReq(token);

    verifyMock.mockReturnValue({ id: 'user1' });
    const populateUser = jest.fn().mockResolvedValue(null);
    findByIdMock.mockReturnValue({ populate: populateUser });

    const res = await GET(req);
    expect(findByIdMock).toHaveBeenCalledWith('user1');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'User not found' });
  });

  it('200 returns hosted and participated quizzes', async () => {
    const token = 'tok';
    const req = makeReq(token);

    verifyMock.mockReturnValue({ id: 'user1' });
    const hosted = [{ _id: 'q1', title: 'T1', description: 'D1', created_at: new Date() }];
    const user = { hosted_quizzes: hosted };
    const populateUser = jest.fn().mockResolvedValue(user);
    findByIdMock.mockReturnValue({ populate: populateUser });

    const pqDocs = [{ quiz_id: { _id: 'q2', title: 'T2', description: 'D2', created_at: new Date() } }];
    const populatePQ = jest.fn().mockResolvedValue(pqDocs);
    findPQMock.mockReturnValue({ populate: populatePQ });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({
      success: true,
      hosted_quizzes: hosted,
      participated_quizzes: [pqDocs[0].quiz_id],
    });
  });

  it('500 on unexpected error', async () => {
    connectMock.mockRejectedValue(new Error('fail'));
    const res = await GET(makeReq('tok'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'internal server error' });
  });
});
