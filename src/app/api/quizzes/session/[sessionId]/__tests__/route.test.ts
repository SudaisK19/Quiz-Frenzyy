import { GET } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import * as dbConfig from '@/dbConfig/dbConfig';
import Session from '@/models/sessionModel';
import Question from '@/models/questionModel';
import * as lodash from 'lodash';

// Mocks
jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }));
jest.mock('@/models/sessionModel', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));
jest.mock('@/models/questionModel', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));

// Stub NextResponse.json for test assertions
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

describe('GET /api/quizzes/session/[sessionId]', () => {
  const connectMock = dbConfig.connect as jest.Mock;
  const findByIdMock = (Session.findById as jest.Mock);
  const findQMock = (Question.find as jest.Mock);
  let shuffleMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    connectMock.mockResolvedValue(undefined);
    shuffleMock = jest.spyOn(lodash, 'shuffle').mockImplementation(arr => arr);
  });

  function makeReq(): NextRequest {
    return {} as any;
  }
  function makeCtx(id?: string) {
    return { params: Promise.resolve({ sessionId: id! }) };
  }

  it('400 when sessionId is missing', async () => {
    const res = await GET(makeReq(), makeCtx(''));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Session ID is required' });
  });

  it('404 when session not found', async () => {
    const populateMock = jest.fn().mockResolvedValue(null);
    findByIdMock.mockReturnValue({ populate: populateMock });

    const res = await GET(makeReq(), makeCtx('S1'));
    expect(findByIdMock).toHaveBeenCalledWith('S1');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Session not found' });
  });

  it('400 when session expired (and deactivates it)', async () => {
    const fakeSession: any = {
      _id: 'S1',
      end_time: new Date(Date.now() - 1000),
      is_active: true,
      save: jest.fn(),
      quiz_id: { _id: 'Q1' },
    };
    const populateMock = jest.fn().mockResolvedValue(fakeSession);
    findByIdMock.mockReturnValue({ populate: populateMock });

    const res = await GET(makeReq(), makeCtx('S1'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Session expired' });
    expect(fakeSession.is_active).toBe(false);
    expect(fakeSession.save).toHaveBeenCalled();
  });

  it('404 when no questions for this quiz', async () => {
    const future = new Date(Date.now() + 10000);
    const fakeSession: any = {
      _id: 'S1',
      end_time: future,
      is_active: true,
      save: jest.fn(),
      quiz_id: { _id: 'Q1', duration: 120 },
      start_time: new Date('2025-03-03T10:00:00Z'),
    };
    const populateMock = jest.fn().mockResolvedValue(fakeSession);
    findByIdMock.mockReturnValue({ populate: populateMock });
    findQMock.mockResolvedValue([]);

    const res = await GET(makeReq(), makeCtx('S1'));
    expect(findQMock).toHaveBeenCalledWith({ quiz_id: 'Q1' });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'No questions available for this quiz' });
  });

  it('500 on unexpected error', async () => {
    connectMock.mockRejectedValue(new Error('boom'));

    const res = await GET(makeReq(), makeCtx('S1'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });
});
