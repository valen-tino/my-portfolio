import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../src/components/LoadingScreen';

describe('LoadingScreen', () => {
  it('renders a brand-blue fullscreen overlay with centered /favicon.ico and ease-in-out CSS transition when loading', () => {
    render(<LoadingScreen isLoading={true} />);

    const overlay = screen.getByTestId('loading-screen');
    expect(overlay).toHaveClass('bg-brand');
    expect(overlay).toHaveClass('transition-opacity');
    expect(overlay).toHaveClass('ease-in-out');
    expect(overlay).toHaveClass('opacity-100');
    expect(overlay).toHaveAttribute('aria-hidden', 'false');
    expect(overlay).toHaveAttribute('role', 'status');

    const img = overlay.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/favicon.ico');
    expect(img).toHaveClass('ease-in-out');
  });

  it('transitions to opacity-0 pointer-events-none and aria-hidden="true" when loading finishes', () => {
    const { rerender } = render(<LoadingScreen isLoading={true} />);
    const overlay = screen.getByTestId('loading-screen');
    expect(overlay).toHaveClass('opacity-100');

    rerender(<LoadingScreen isLoading={false} />);
    expect(overlay).toHaveClass('opacity-0');
    expect(overlay).toHaveClass('pointer-events-none');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });
});

