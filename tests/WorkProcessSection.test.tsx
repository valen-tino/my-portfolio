import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkProcessSection } from '../src/components/WorkProcessSection';

describe('WorkProcessSection', () => {
  it('renders single-row tablist with all 5 Design Thinking steps', () => {
    render(<WorkProcessSection />);

    const tablist = screen.getByRole('tablist', { name: 'Design Thinking steps' });
    expect(tablist.className).toContain('flex-nowrap');

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual([
      'Empathize',
      'Define',
      'Ideate',
      'Prototype',
      'Test',
    ]);

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Empathize');
  });

  it('supports keyboard navigation (ArrowRight, ArrowLeft, End, Home) and prev/next buttons', () => {
    render(<WorkProcessSection />);

    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();

    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[1]);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Define');

    fireEvent.keyDown(tabs[1], { key: 'End' });
    expect(tabs[4]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[4]);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Test');

    fireEvent.keyDown(tabs[4], { key: 'Home' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[0]);

    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(tabs[4]).toHaveAttribute('aria-selected', 'true');

    const prevBtn = screen.getByRole('button', { name: 'Previous process step' });
    const nextBtn = screen.getByRole('button', { name: 'Next process step' });
    expect(nextBtn).toBeDisabled();

    fireEvent.click(prevBtn);
    expect(tabs[3]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Prototype');
    expect(nextBtn).not.toBeDisabled();
  });
});

