/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import SignupPage from '../page'
import axios from 'axios'

// Axios ko mock kar rahe hain, taake real HTTP request na jaye
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Next.js router.push ko mock karke redirect ko track karenge
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('SignupPage Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    pushMock.mockClear()
  })
  afterEach(() => jest.useRealTimers())

  it('should display success message and redirect after 2 seconds', async () => {
    // Arrange: successful signup ka mock response
    mockedAxios.post.mockResolvedValue({ status: 201 })

    // Render component
    render(<SignupPage />)

    // Inputs aur button selec­t karna
    const usernameInput = screen.getByPlaceholderText('Username')
    const emailInput    = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton  = screen.getByRole('button', { name: /sign up/i })

    // Act: form fill & submit
    fireEvent.change(usernameInput, { target: { value: 'alice' } })
    fireEvent.change(emailInput,    { target: { value: 'alice@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Assert: success message nazar aaye
    await waitFor(() =>
      expect(screen.getByText('Signup successful!')).toBeInTheDocument()
    )

    // Act: 2s timeout advance karke redirect
    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    // Assert: router.push('/login') call hui
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('should display error message if signup fails (e.g., user exists)', async () => {
    // Arrange: axios.isAxiosError ko true mock karo
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    // Arrange: AxiosError me response.data.error set karo
    const axiosError = new Error('Request failed') as any
    axiosError.response = { data: { error: 'User already exists' } }
    mockedAxios.post.mockRejectedValue(axiosError)

    // Render component
    render(<SignupPage />)
    const usernameInput = screen.getByPlaceholderText('Username')
    const emailInput    = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton  = screen.getByRole('button', { name: /sign up/i })

    // Act: fill & submit
    fireEvent.change(usernameInput, { target: { value: 'alice' } })
    fireEvent.change(emailInput,    { target: { value: 'alice@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Assert: specific error message nazar aaye
    await waitFor(() =>
      expect(screen.getByText('User already exists')).toBeInTheDocument()
    )
  })

  it('should display fallback error message on unexpected error', async () => {
    // Arrange: generic Error throw karo
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(false)
    mockedAxios.post.mockRejectedValue(new Error('Network error'))

    // Render component
    render(<SignupPage />)
    const usernameInput = screen.getByPlaceholderText('Username')
    const emailInput    = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton  = screen.getByRole('button', { name: /sign up/i })

    // Act
    fireEvent.change(usernameInput, { target: { value: 'alice' } })
    fireEvent.change(emailInput,    { target: { value: 'alice@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Assert: fallback error message nazar aaye
    await waitFor(() =>
      expect(
        screen.getByText('An unexpected error occurred. Please try again.')
      ).toBeInTheDocument()
    )
  })
})
