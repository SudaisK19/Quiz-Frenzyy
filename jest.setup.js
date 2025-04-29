// jest.setup.js
import '@testing-library/jest-dom'

// 1. TextEncoder/TextDecoder for MongoDB
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// 2. IntersectionObserver stub for Next.js Link/viewport hooks
class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = IntersectionObserver

// 3. Minimal fetch-style globals so next/server loads
global.Request = class Request { constructor(i, init){ this.input=i; this.init=init } }
global.Response = class Response {
  constructor(body, init){ this._body=body; this._init=init }
  json(){ return Promise.resolve(this._body) }
}
global.Headers = class Headers { constructor(init){ this._init=init } }

// 4. Override NextResponse.json so cookies.set/get work
const { NextResponse } = require('next/server')
NextResponse.json = (body, init) => ({
  status: init?.status,
  cookies: {
    set: () => {},                              // stub set()
    get: (name) => name === 'authToken' ? 'fakeJwt' : undefined
  },
  json: () => Promise.resolve(body)
})
