/**
 * @jest-environment node
 */
import { POST } from '../route'
import { connect } from '@/dbConfig/dbConfig'
import User from '@/models/userModel'

jest.mock('@/dbConfig/dbConfig', () => ({ connect: jest.fn() }))
jest.mock('@/models/userModel')

describe('POST /api/users/signup route', () => {
  beforeEach(() => { (connect as jest.Mock).mockClear(); (User.findOne as jest.Mock).mockClear() })

  it('returns 400 when fields are missing', async () => {
    const req = { json: jest.fn().mockResolvedValue({ username:'', email:'', password:'' }) } as any
    const res = await POST(req)
    expect(res!.status).toBe(400)
    expect(await res!.json()).toEqual({ error: 'All fields are required' })
  })

  it('returns 400 if user already exists', async () => {
    ;(connect as jest.Mock).mockResolvedValue(null)
    ;(User.findOne as jest.Mock).mockResolvedValue({ _id: 'u1' })
    const req = { json: jest.fn().mockResolvedValue({ username:'a', email:'a@b.com', password:'p' }) } as any
    const res = await POST(req)
    expect(res!.status).toBe(400)
    expect(await res!.json()).toEqual({ error: 'User already exists' })
  })

  it('returns 201 and user on success', async () => {
    ;(connect as jest.Mock).mockResolvedValue(null)
    ;(User.findOne as jest.Mock).mockResolvedValue(null)
    const mockSave = jest.fn().mockResolvedValue({ _id:'u1',username:'a',email:'a@b.com' })
    ;(User as any).mockImplementation(() => ({ save: mockSave }))
    const req = { json: jest.fn().mockResolvedValue({ username:'a', email:'a@b.com', password:'p' }) } as any
    const res = await POST(req)
    expect(res!.status).toBe(201)
    expect(await res!.json()).toEqual({
      message: 'User created successfully',
      success: true,
      user: { _id:'u1',username:'a',email:'a@b.com' }
    })
  })

  it('returns 500 on DB error', async () => {
    ;(connect as jest.Mock).mockRejectedValue(new Error('failDB'))
    const req = { json: jest.fn().mockResolvedValue({ username:'a', email:'a@b.com', password:'p' }) } as any
    const res = await POST(req)
    expect(res!.status).toBe(500)
    expect(await res!.json()).toEqual({ error: 'failDB' })
  })
})
