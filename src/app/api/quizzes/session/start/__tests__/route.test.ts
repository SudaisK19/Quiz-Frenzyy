import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import * as dbConfig from '@/dbConfig/dbConfig';
import Quiz from '@/models/quizModel';
import Session from '@/models/sessionModel';
import UserNew from '@/models/userModel';
import jwt from 'jsonwebtoken';

// Mock modules
jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }));
jest.mock('@/models/quizModel', () => ({ findById: jest.fn() }));
jest.mock('@/models/sessionModel', () => {
  const mockSave = jest.fn();
  const MockSession = jest.fn().mockImplementation(() => ({
    save: mockSave,
    _id: 'sess1',
    join_code: 'JOIN123',
  }));
  return {
    __esModule: true,
    default: MockSession,
    save: mockSave,
  };
});
jest.mock('@/models/userModel', () => ({ findByIdAndUpdate: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));

// Stub NextResponse.json for assertions
beforeAll(() => {
  jest.spyOn(NextResponse, 'json').mockImplementation((body, init) => ({
    status: init?.status,
    headers: init?.headers,
    json: async () => body,
  }) as any);
});
afterAll(() => {
  (NextResponse.json as jest.Mock).mockRestore();
});

describe('POST /api/quizzes/session', () => {
  const connectMock = dbConfig.connect as jest.Mock;
  const findByIdMock = (Quiz.findById as jest.Mock);
  // Retrieve the mocked module to get properly typed jest.Mock functions
const sessionModule = jest.requireMock('@/models/sessionModel') as {
  default: jest.Mock;
  save: jest.Mock;
};
const SessionConstructor = sessionModule.default;
const saveMock = sessionModule.save;
  const updateUserMock = (UserNew.findByIdAndUpdate as jest.Mock);
  const verifyMock = (jwt.verify as jest.Mock);

  function makeReq(body: any, token?: string): NextRequest {
    return {
      json: jest.fn().mockResolvedValue(body),
      cookies: { get: jest.fn().mockReturnValue(token ? { value: token } : undefined) },
    } as unknown as NextRequest;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    connectMock.mockResolvedValue(undefined);
  });

  it('400 when quizId is missing', async () => {
    const req = makeReq({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Quiz ID is required' });
  });

  it('401 when token is missing', async () => {
    const req = makeReq({ quizId: 'q1' });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('500 on invalid token (jwt.verify throws)', async () => {
    const token = 'bad';
    const req = makeReq({ quizId: 'q1' }, token);
    verifyMock.mockImplementation(() => { throw new Error('invalid'); });

    const res = await POST(req);
    expect(verifyMock).toHaveBeenCalledWith(token, process.env.JWT_SECRET!);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });

  it('404 when quiz not found', async () => {
    const token = 'tok';
    const req = makeReq({ quizId: 'q1' }, token);
    verifyMock.mockReturnValue({ id: 'user1' });
    findByIdMock.mockResolvedValue(null);

    const res = await POST(req);
    expect(findByIdMock).toHaveBeenCalledWith('q1');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Quiz not found' });
  });

  it('201 on success', async () => {
    const token = 'tok';
    const req = makeReq({ quizId: 'q1', duration: 15 }, token);
    verifyMock.mockReturnValue({ id: 'user1' });
    findByIdMock.mockResolvedValue({ _id: 'q1', duration: 20 });
    saveMock.mockResolvedValue(undefined);
    updateUserMock.mockResolvedValue({ _id: 'user1', hosted_quizzes: ['q1'] });

    const res = await POST(req);
    expect(findByIdMock).toHaveBeenCalledWith('q1');
    expect(SessionConstructor).toHaveBeenCalledWith(expect.objectContaining({ quiz_id: 'q1' }));
    expect(saveMock).toHaveBeenCalled();
    expect(updateUserMock).toHaveBeenCalledWith(
      'user1',
      { $addToSet: { hosted_quizzes: 'q1' } },
      { new: true }
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      success: true,
      sessionId: 'sess1',
      join_code: 'JOIN123',
      message: 'New session created successfully',
    });
  });

  it('500 on unexpected error', async () => {
    // Simulate db connect failure
    connectMock.mockRejectedValue(new Error('fail'));
    const req = makeReq({ quizId: 'q1' }, 'tok');

    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });
});
