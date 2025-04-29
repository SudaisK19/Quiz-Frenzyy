/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Footer from './Footer'
import { useRouter } from 'next/navigation'

// mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('<Footer />', () => {
  const pushMock = jest.fn()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: pushMock })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders ©…All rights reserved and Powered by NOVA', () => {
    render(<Footer />)
    // © 2024 Quiz Frenzy. All rights reserved.
    expect(
      screen.getByText(/©\s*2024\s*Quiz\s*Frenzy\.\s*All\s*rights\s*reserved\./)
    ).toBeInTheDocument()

    // The “Powered by” text node
    expect(screen.getByText(/Powered\s*by/i)).toBeInTheDocument()
    // The “NOVA” span
    expect(screen.getByText('NOVA')).toBeInTheDocument()
  })

  it('navigates to /helpcenter when Help Center is clicked', () => {
    render(<Footer />)
    // Match the NBSP with \s*
    const helpBtn = screen.getByRole('button', { name: /Help\s*Center/i })
    fireEvent.click(helpBtn)
    expect(pushMock).toHaveBeenCalledWith('/helpcenter')
  })

  it('does not navigate when Contact is clicked', () => {
    render(<Footer />)
    const contactBtn = screen.getByRole('button', { name: /Contact/i })
    fireEvent.click(contactBtn)
    expect(pushMock).not.toHaveBeenCalled()
  })
})
