import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkProcessSection } from '../src/components/WorkProcessSection';

describe('WorkProcessSection', () => {
  it('renders single-row tablist with all 6 work process steps and updated subtitle', () => {
    render(<WorkProcessSection />);

    expect(
      screen.getByText(
        /I combine design thinking with spec-driven development—from research and prototyping through structured engineering, automated testing, and iterative delivery\./i
      )
    ).toBeInTheDocument();

    const tablist = screen.getByRole('tablist', { name: 'Work process steps' });
    expect(tablist.className).toContain('flex-nowrap');

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual([
      'Empathize',
      'Define',
      'Ideate',
      'Prototype',
      'Development',
      'Test',
    ]);

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Empathize');
  });

  it('supports keyboard navigation (ArrowRight, ArrowLeft, End, Home) and prev/next buttons across 6 steps', () => {
    render(<WorkProcessSection />);

    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();

    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[1]);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Define');

    fireEvent.keyDown(tabs[1], { key: 'End' });
    expect(tabs[5]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[5]);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Test');

    fireEvent.keyDown(tabs[5], { key: 'Home' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[0]);

    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(tabs[5]).toHaveAttribute('aria-selected', 'true');

    const prevBtn = screen.getByRole('button', { name: 'Previous process step' });
    const nextBtn = screen.getByRole('button', { name: 'Next process step' });
    expect(nextBtn).toBeDisabled();

    fireEvent.click(prevBtn);
    expect(tabs[4]).toHaveAttribute('aria-selected', 'true');
    const devPanel = screen.getByRole('tabpanel');
    expect(devPanel).toHaveTextContent('Development');
    expect(devPanel).toHaveTextContent(/Spec-Driven Development/i);
    expect(devPanel).toHaveTextContent(/PRD/i);
    expect(devPanel).toHaveTextContent(/ERD/i);
    expect(nextBtn).not.toBeDisabled();
  });

  it('renders custom CMS steps when provided and falls back to defaults when empty', () => {
    const customSteps = [
      { id: '1', title: 'Discover', description: 'Research goals and constraints.' },
      { id: '2', title: 'Ship', description: 'Release cleanly to production.' },
    ];

    const { rerender } = render(<WorkProcessSection steps={customSteps} />);
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Discover', 'Ship']);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Research goals and constraints.');

    rerender(<WorkProcessSection steps={[]} />);
    expect(screen.getAllByRole('tab')).toHaveLength(6);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Empathize');
  });
});

