import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FloatingNavigation } from '../src/components/FloatingNavigation';

describe('FloatingNavigation', () => {
  it('renders Primary dock navigation and calls onOpenCVModal from Résumé button', () => {
    const onOpenCVModal = vi.fn();
    render(
      <MemoryRouter initialEntries={['/']}>
        <FloatingNavigation onOpenCVModal={onOpenCVModal} />
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/portfolio');
    expect(screen.getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '/blogs');
    expect(screen.queryByRole('link', { name: /Design system/i })).toBeNull();

    const resumeBtn = screen.getByRole('button', { name: /Résumé/i });
    expect(resumeBtn).toHaveClass('dock-item', 'dock-item-primary');
    expect(resumeBtn).not.toHaveClass('dock-item-active');
    expect(resumeBtn.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
    fireEvent.click(resumeBtn);
    expect(onOpenCVModal).toHaveBeenCalledTimes(1);
  });

  it('supports preview mode with Example nav label and marks Work active on /portfolio route', () => {
    render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <FloatingNavigation onOpenCVModal={vi.fn()} preview />
      </MemoryRouter>
    );

    expect(screen.getByRole('navigation', { name: 'Example' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
  });

  it('toggles mobile More drawer, closes on Escape restoring focus, and triggers View résumé', () => {
    const onOpenCVModal = vi.fn();
    render(
      <MemoryRouter initialEntries={['/']}>
        <FloatingNavigation onOpenCVModal={onOpenCVModal} />
      </MemoryRouter>
    );

    const moreBtn = screen.getByRole('button', { name: /More/i });
    expect(moreBtn).toHaveAttribute('aria-expanded', 'false');

    const controlledId = moreBtn.getAttribute('aria-controls');
    expect(controlledId).toBeTruthy();
    const drawer = document.getElementById(controlledId!);
    expect(drawer).toHaveAttribute('hidden');

    fireEvent.click(moreBtn);
    expect(moreBtn).toHaveAttribute('aria-expanded', 'true');
    expect(drawer).not.toHaveAttribute('hidden');

    fireEvent.keyDown(drawer!, { key: 'Escape' });
    expect(moreBtn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(moreBtn);

    fireEvent.click(moreBtn);
    const viewResumeBtn = screen.getByRole('button', { name: /View résumé/i });
    fireEvent.click(viewResumeBtn);
    expect(onOpenCVModal).toHaveBeenCalledTimes(1);
    expect(moreBtn).toHaveAttribute('aria-expanded', 'false');
  });
});

