import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorialCarousel } from '../src/components/EditorialCarousel';

describe('EditorialCarousel', () => {
  it('renders carousel region, slide groups with aria labels, and scrolls track on Next/Previous', () => {
    render(
      <EditorialCarousel label="Featured projects">
        <div>Slide One</div>
        <div>Slide Two</div>
        <div>Slide Three</div>
      </EditorialCarousel>
    );

    const region = screen.getByRole('region', { name: 'Featured projects' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');

    const slides = screen.getAllByRole('group');
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute('aria-roledescription', 'slide');
    expect(slides[0]).toHaveAttribute('aria-label', '1 of 3');
    expect(slides[2]).toHaveAttribute('aria-label', '3 of 3');

    const prevBtn = screen.getByRole('button', { name: 'Previous Featured projects' });
    const nextBtn = screen.getByRole('button', { name: 'Next Featured projects' });
    const trackId = nextBtn.getAttribute('aria-controls')!;
    const track = document.getElementById(trackId)!;

    const scrollBySpy = vi.fn();
    track.scrollBy = scrollBySpy;
    Object.defineProperty(track, 'clientWidth', { value: 400, configurable: true });
    Object.defineProperty(track, 'scrollWidth', { value: 1200, configurable: true });
    Object.defineProperty(track, 'scrollLeft', { value: 100, configurable: true });
    fireEvent.scroll(track);

    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);
    expect(scrollBySpy).toHaveBeenCalledWith(expect.objectContaining({ left: expect.any(Number) }));
    expect(scrollBySpy.mock.calls[0][0].left).toBeGreaterThan(0);

    fireEvent.click(prevBtn);
    expect(scrollBySpy.mock.calls[1][0].left).toBeLessThan(0);
  });
});

