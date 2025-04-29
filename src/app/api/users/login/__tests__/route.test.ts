

// src/pages/api/users/login/__tests__/route.test.ts
/**
 * @jest-environment node
 */

import { POST } from '../route'
import User from '@/models/userModel'
import { connect } from '@/dbConfig/dbConfig'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

// DB connection function ko mock kar rahe hain
jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }))
// User model ko mock karke findOne ko control karenge
jest.mock('@/models/userModel')
// JWT sign ko mock karke token fix kar rahe hain
jest.mock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('fakeJwt') }))

describe('POST /api/users/login route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Arrange: JWT_SECRET environment variable set karna
    process.env = { ...originalEnv, JWT_SECRET: 'secretKey' }
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env = originalEnv
  })

  it('returns 404 if user not found', async () => {
    // Arrange: connect() success, lekin User.findOne null return kare
    ;(connect as jest.Mock).mockResolvedValue(null)
    ;(User.findOne as jest.Mock).mockResolvedValue(null)

    // Arrange: fake NextRequest object
    const req = {
      json: jest.fn().mockResolvedValue({ email: 'a@b.com', password: '123' })
    } as unknown as NextRequest

    // Act: POST handler call karna
    const res = await POST(req)

    // Assert: status 404 aur correct error message
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data).toEqual({ error: 'User not found' })
  })

  it('returns 401 if password does not match', async () => {
    // Arrange: valid user return karna lekin wrong password
    ;(connect as jest.Mock).mockResolvedValue(null)
    ;(User.findOne as jest.Mock).mockResolvedValue({ password: 'right', _id: 'u1' })

    const req = {
      json: jest.fn().mockResolvedValue({ email: 'a@b.com', password: 'wrong' })
    } as unknown as NextRequest

    // Act: POST handler call
    const res = await POST(req)

    // Assert: status 401 aur invalid error message
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data).toEqual({ error: 'Invalid email or password' })
  })

  it('returns 200 and sets cookie on valid credentials', async () => {
    // Arrange: valid user aur JWT mock
    ;(connect as jest.Mock).mockResolvedValue(null)
    ;(User.findOne as jest.Mock).mockResolvedValue({ password: 'pass', _id: 'u1' })
    ;(jwt.sign as jest.Mock).mockReturnValue('fakeJwt')

    const req = {
      json: jest.fn().mockResolvedValue({ email: 'a@b.com', password: 'pass' })
    } as unknown as NextRequest

    // Act: POST handler call
    const res = await POST(req)

    // Assert: status 200, success JSON aur cookie set
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ message: 'Login Successful', success: true })
    // Roman Urdu: yahan authToken cookie check karna hai
    expect(res.cookies.get('authToken')).toBeDefined()
  })

  it('returns 500 on DB error', async () => {
    // Arrange: connect() reject karna
    ;(connect as jest.Mock).mockRejectedValue(new Error('failDB'))

    const req = {
      json: jest.fn().mockResolvedValue({ email: 'a@b.com', password: 'pass' })
    } as unknown as NextRequest

    // Act: POST handler call
    const res = await POST(req)

    // Assert: status 500 aur login failed JSON
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data).toEqual({ error: 'Login Failed' })
  })
})
