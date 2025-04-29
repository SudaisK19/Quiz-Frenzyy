/**
 * @jest-environment node
 */
import { GET, PATCH } from '../route'
import { connect } from '@/dbConfig/dbConfig'
import User from '@/models/userModel'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }))
jest.mock('@/models/userModel', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}))
jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }))

describe('GET /api/users/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'secret'
  })

  it('returns 401 if no token', async () => {
    const req = { cookies: { get: () => undefined } } as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized access' })
  })

  it('returns 200 and user on valid token', async () => {
    ;(jwt.verify as jest.Mock).mockReturnValue({ id: 'u1' })
    ;(connect as jest.Mock).mockResolvedValue(null)
    const fakeUser = {
      _id: 'u1',
      username: 'user',
      email: 'user@example.com',
      isVerified: true,
      badges: [],
      hosted_quizzes: [],
    }
    ;(User.findById as jest.Mock).mockReturnValue({
      select: () => ({ populate: jest.fn().mockResolvedValue(fakeUser) }),
    })

    const req = { cookies: { get: () => ({ value: 'validtoken' }) } } as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, user: fakeUser })
  })
})

describe('PATCH /api/users/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'secret'
  })

  it('returns 401 if token invalid', async () => {
    const req = { cookies: { get: () => undefined } } as unknown as NextRequest
    const res = await PATCH(req)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized access' })
  })

  it('returns 200 and updated user on success', async () => {
    ;(jwt.verify as jest.Mock).mockReturnValue({ id: 'u1' })
    const updatedUser = { _id: 'u1', username: 'newuser', email: 'new@example.com' }
    ;(User.findByIdAndUpdate as jest.Mock).mockReturnValue({
      select: () => Promise.resolve(updatedUser),
    })

    const req = {
      cookies: { get: () => ({ value: 'validtoken' }) },
      json: jest.fn().mockResolvedValue({
        username: 'newuser',
        email: 'new@example.com',
        password: '',
      }),
    } as unknown as NextRequest

    const res = await PATCH(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  })

  it('returns 500 on DB error', async () => {
    ;(jwt.verify as jest.Mock).mockReturnValue({ id: 'u1' })
    ;(User.findByIdAndUpdate as jest.Mock).mockReturnValue({
      select: () => Promise.reject(new Error('failDB')),
    })

    const req = {
      cookies: { get: () => ({ value: 'validtoken' }) },
      json: jest.fn().mockResolvedValue({
        username: 'user',
        email: 'email@example.com',
        password: '',
      }),
    } as unknown as NextRequest

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const res = await PATCH(req)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Internal server error' })
    consoleSpy.mockRestore()
  })
})
