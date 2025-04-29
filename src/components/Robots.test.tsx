/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Robots from './Robots'

// next/image ko simple <img> banane ke liye mock
jest.mock('next/image', () => (props: any) => <img {...props} />)

describe('<Robots />', () => {
  beforeAll(() => {
    // Math.random ko deterministic banane ke liye stub
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterAll(() => {
    // original Math.random wapis lao
    ;(Math.random as jest.Mock).mockRestore()
  })

  it('always renders a wrapper div immediately', () => {
    // Arrange
    const { container } = render(<Robots />)
    // Assert: initial render pe bhi ek div hona chahiye
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement)
  })

  it('renders 60 images after mount', async () => {
    // Arrange
    render(<Robots />)
    // Act & Assert: useEffect ke baad images aani chahiye
    await waitFor(() => {
      const imgs = screen.getAllByAltText('Falling Robot')
      expect(imgs).toHaveLength(60)
    })
  })

  it('calculates correct styles for the first robot', async () => {
    // Arrange
    render(<Robots />)
    await waitFor(() => screen.getAllByAltText('Falling Robot'))

    // Act
    const first = screen.getAllByAltText('Falling Robot')[0]

    // Assert: Math.random() === 0.5 hone par
    // spacing = 100/60 ≈ 1.6667 → fixedLeft = 0
    // duration = 25 + 0.5*8 = 29
    // delay = 0.5*30 = 15
    // rotation = 0.5*40 - 20 = 0
    expect(first.style.left).toBe('calc(0vw - 15px)')
    expect(first.style.top).toBe('-10%')
    expect(first.style.animation).toContain('29s linear infinite')
    expect(first.style.animationDelay).toBe('15s')
    expect(first.style.transform).toBe('rotate(0deg)')
  })
})
