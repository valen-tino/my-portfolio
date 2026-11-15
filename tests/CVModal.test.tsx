import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CVModal } from '../src/components/CVModal';

describe('CVModal', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('uses native <dialog closedby="any">, calls showModal/close, and does not mutate body.style.overflow', () => {
    const onClose = vi.fn();
    const { rerender } = render(<CVModal isOpen={false} onClose={onClose} />);

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('closedby')).toBe('any');
    expect(dialog.open).toBe(false);

    rerender(<CVModal isOpen={true} onClose={onClose} />);
    expect(dialog.open).toBe(true);
    expect(document.body.style.overflow).toBe('');

    const closeBtn = screen.getByRole('button', { name: 'Close résumé' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<CVModal isOpen={false} onClose={onClose} />);
    expect(dialog.open).toBe(false);
  });

  it('renders downloadable CV link when cvURL is provided, or mailto fallback when empty', () => {
    const { rerender } = render(
      <CVModal isOpen={true} onClose={vi.fn()} cvURL="https://example.com/cv.pdf" />
    );

    const downloadLink = screen.getByRole('link', { name: /Download full résumé/i });
    expect(downloadLink).toHaveAttribute('href', 'https://example.com/cv.pdf');
    expect(downloadLink).toHaveAttribute('target', '_blank');

    rerender(<CVModal isOpen={true} onClose={vi.fn()} cvURL="" />);
    const requestLink = screen.getByRole('link', { name: /Request full résumé/i });
    expect(requestLink).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:valentinojehaut@gmail.com'),
    );
  });

  it('orders experiences and education with the latest end date first inside the résumé popup', () => {
    render(
      <CVModal
        isOpen={true}
        onClose={vi.fn()}
        experiences={[
          {
            id: 'e-old',
            role: 'Junior Dev',
            company: 'Old Studio',
            period: 'Jan 2020 - Dec 2022',
            type: 'Full-time',
            description: 'Past role',
          },
          {
            id: 'e-now',
            role: 'Lead Designer',
            company: 'Studio Bali',
            period: 'Jan 2024 - Present',
            type: 'Full-time',
            description: 'Current role',
          },
        ]}
        educationList={[
          {
            id: 'ed-old',
            degree: 'Older Bootcamp',
            institution: 'Academy A',
            period: 'Jan 2022 - Mar 2022',
            description: 'Early course',
          },
          {
            id: 'ed-newest',
            degree: 'B.Sc. Honors',
            institution: 'HELP University',
            period: 'Oct 2024 - Jul 2026',
            description: 'Latest degree',
          },
          {
            id: 'ed-mid',
            degree: 'Information Systems',
            institution: 'ITB STIKOM Bali',
            period: 'Sep 2021 - Sep 2024',
            description: 'Dual degree',
          },
        ]}
      />,
    );

    const expLead = screen.getByText('Lead Designer / Studio Bali');
    const expOld = screen.getByText('Junior Dev / Old Studio');
    expect(expLead.compareDocumentPosition(expOld) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Only top 2 education items with latest end dates remain visible
    const newestEdu = screen.getByText('B.Sc. Honors');
    const midEdu = screen.getByText('Information Systems');
    expect(newestEdu.compareDocumentPosition(midEdu) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText('Older Bootcamp')).toBeNull();
  });
});
