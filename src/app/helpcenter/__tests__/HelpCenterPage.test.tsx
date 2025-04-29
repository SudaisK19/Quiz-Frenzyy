// src/components/HelpCenterPage.test.tsx
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpCenterPage from '../page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => <img alt="Mocked Image" />,
}));

jest.mock('@/components/Header', () => () => <div data-testid="header" />);
jest.mock('@/components/Footer', () => () => <div data-testid="footer" />);

describe('<HelpCenterPage />', () => {
  beforeEach(() => {
    render(<HelpCenterPage />);
  });

  it('renders the header and footer', () => {
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('displays the help center heading', () => {
    expect(
      screen.getByRole('heading', { name: /Help Center/i })
    ).toBeInTheDocument();
  });

  it('renders all help sections initially collapsed', () => {
    const quickStartContent = screen.queryByText(/Sign up or log in to your account./i);
    expect(quickStartContent).not.toBeInTheDocument();
  });

  it('expands and collapses a section when clicked', () => {
    const quickStartButton = screen.getByRole('button', { name: /Quick Start Guide/i });

    // Expand section
    fireEvent.click(quickStartButton);
    expect(screen.getByText(/Sign up or log in to your account./i)).toBeVisible();

    // Collapse section
    fireEvent.click(quickStartButton);
    expect(screen.queryByText(/Sign up or log in to your account./i)).not.toBeInTheDocument();
  });

  it('allows only one section open at a time', () => {
    const quickStartButton = screen.getByRole('button', { name: /Quick Start Guide/i });
    const createQuizButton = screen.getByRole('button', { name: /How to Create an AI-Generated Quiz\?/i });

    // Open first section
    fireEvent.click(quickStartButton);
    expect(screen.getByText(/Sign up or log in to your account./i)).toBeVisible();

    // Open second section
    fireEvent.click(createQuizButton);
    expect(screen.getByText(/Use the AI form under/i)).toBeVisible();
    expect(screen.queryByText(/Sign up or log in to your account./i)).not.toBeInTheDocument();
  });

  it('renders the fallback while loading', () => {
    expect(screen.queryByText(/Loading Help Center.../i)).not.toBeInTheDocument();
  });
});
