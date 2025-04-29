// src/app/login/__tests__/login.test.tsx
/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import LoginPage from '../page'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    pushMock.mockClear()
  })
  afterEach(() => jest.useRealTimers())

  it('should display success message and redirect after 2 seconds', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 })
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() =>
      expect(screen.getByText('Login successful!')).toBeInTheDocument()
    )

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('should display fallback error message on invalid credentials', async () => {
    mockedAxios.post.mockRejectedValue(new Error('network error'))
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() =>
      expect(
        screen.getByText('An unexpected error occurred. Please try again.')
      ).toBeInTheDocument()
    )
  })
})
