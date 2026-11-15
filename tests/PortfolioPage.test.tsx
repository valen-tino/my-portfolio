import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PortfolioPage from '../src/pages/PortfolioPage';
import { CMSStorage } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getPortfolios: vi.fn(),
  },
}));

const mockItems = [
  {
    id: 'proj-alpha',
    title: 'Alpha Design System',
    desc: 'Accessible UI kit for enterprise teams.',
    category: 'Design',
    tech: ['Figma', 'React'],
    images: [],
    imageURL: 'https://res.cloudinary.com/demo/image/upload/alpha.jpg',
    linkTo: 'https://www.vercel.com/design-system',
    year: '2026',
    role: 'UI/UX Designer',
    roles: ['UI/UX Designer'],
    isPasswordProtected: false,
    password: '',
    isPublished: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'proj-beta',
    title: 'Beta Secret Portal',
    desc: 'Internal analytics platform.',
    category: 'Development',
    tech: ['TypeScript'],
    images: [],
    imageURL: '',
    year: '2025',
    role: 'Developer',
    roles: ['Developer'],
    isPasswordProtected: true,
    password: 'secret-pass',
    isPublished: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
];

describe('PortfolioPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue(mockItems as any);
  });

  it('renders <search> filters, filters by role, year, tech, and keyword, and resets empty state', async () => {
    render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <PortfolioPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 projects')).toBeInTheDocument();
    });

    const searchLandmark = document.querySelector('search[aria-label="Filter projects"]');
    expect(searchLandmark).toBeInTheDocument();

    const designerBtn = screen.getByRole('button', { name: /UI\/UX Designer/i });
    expect(designerBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(designerBtn);
    expect(designerBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 2 projects');
    expect(screen.getByRole('heading', { level: 3, name: 'Alpha Design System' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'Beta Secret Portal' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Clear filters/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 projects');

    // Duplicate Year and Technology <select> inputs were removed in the slimmed filter bar
    expect(screen.queryByLabelText('Year')).toBeNull();
    expect(screen.queryByLabelText('Technology')).toBeNull();

    fireEvent.click(screen.getByTestId('year-filter-2026'));
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 2 projects');

    fireEvent.click(screen.getByTestId('portfolio-tech-dropdown-btn'));
    fireEvent.click(screen.getByTestId('tech-option-Figma'));
    expect(screen.getByRole('heading', { level: 3, name: 'Alpha Design System' })).toBeInTheDocument();

    const searchInput = screen.getByLabelText('Search projects');
    fireEvent.change(searchInput, { target: { value: 'NonExistentXYZ' } });
    expect(screen.getByRole('status')).toHaveTextContent('Showing 0 of 2 projects');
    expect(screen.getByText(/No projects for/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show all projects' }));
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 projects');
  });

  it('supports interactive Year pills, multi-select Technology dropdown with removable chips, and role keyword search', async () => {
    render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <PortfolioPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 projects')).toBeInTheDocument();
    });

    // Interactive year filter pills (non-protected projects publish their year)
    const year2026Pill = screen.getByTestId('year-filter-2026');
    fireEvent.click(year2026Pill);
    expect(year2026Pill).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 2 projects');
    expect(screen.getByRole('heading', { level: 3, name: 'Alpha Design System' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('year-filter-All'));
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 projects');

    // Multi-select technology dropdown + removable tech chips
    const dropdownBtn = screen.getByTestId('portfolio-tech-dropdown-btn');
    fireEvent.click(dropdownBtn);
    expect(screen.getByTestId('portfolio-tech-menu')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tech-option-Figma'));
    expect(screen.getByTestId('selected-tech-pill-Figma')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 2 projects');

    fireEvent.click(screen.getByTestId('tech-option-TypeScript'));
    expect(screen.getByTestId('selected-tech-pill-TypeScript')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 projects');

    fireEvent.click(screen.getByRole('button', { name: 'Remove TypeScript filter' }));
    expect(screen.queryByTestId('selected-tech-pill-TypeScript')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 2 projects');

    fireEvent.click(screen.getByRole('button', { name: 'Remove Figma filter' }));
    expect(screen.queryByTestId('selected-tech-pill-Figma')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 projects');

    // Keyword search matches across project roles as well
    const searchInput = screen.getByLabelText('Search projects');
    fireEvent.change(searchInput, { target: { value: 'Developer' } });
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 2 projects');
    expect(screen.getByRole('heading', { level: 3, name: 'Beta Secret Portal' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('clear-portfolio-filters'));
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 projects');
  });

  it('opens PasswordProtectionModal for protected projects and unlocks on valid password', async () => {
    render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <Routes>
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:id" element={<div data-testid="unlocked-detail">Unlocked</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Beta Secret Portal' })).toBeInTheDocument();
    });

    const protectedLink = screen.getByRole('link', { name: /View project: Beta Secret Portal/i });
    fireEvent.click(protectedLink);

    const passwordInput = screen.getByLabelText('Enter Password') as HTMLInputElement;
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Access Portfolio' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password. Please try again.');

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Access Portfolio' })).not.toBeDisabled();
      },
      { timeout: 2000 }
    );

    fireEvent.change(passwordInput, { target: { value: 'secret-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Access Portfolio' }));

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-detail')).toBeInTheDocument();
    });
  });

  it('switches between Grid and Table views via click, toolbar arrow keys, and ?view=table URL param', async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <PortfolioPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('portfolio-grid-view')).toBeInTheDocument();
    });

    const toolbar = screen.getByRole('toolbar', { name: 'View options' });
    expect(toolbar).toBeInTheDocument();

    const gridBtn = screen.getByTestId('view-mode-grid');
    const tableBtn = screen.getByTestId('view-mode-table');
    expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
    expect(gridBtn).toHaveAttribute('tabindex', '0');
    expect(tableBtn).toHaveAttribute('aria-pressed', 'false');
    expect(tableBtn).toHaveAttribute('tabindex', '-1');

    // Switch via keyboard ArrowRight inside toolbar
    gridBtn.focus();
    fireEvent.keyDown(gridBtn, { key: 'ArrowRight' });

    expect(tableBtn).toHaveAttribute('aria-pressed', 'true');
    expect(tableBtn).toHaveAttribute('tabindex', '0');
    expect(gridBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByTestId('portfolio-grid-view')).toBeNull();

    const tableView = screen.getByTestId('portfolio-table-view');
    expect(tableView).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Selected projects directory' })).toBeInTheDocument();
    const alphaRow = screen.getByTestId('portfolio-table-row-proj-alpha');
    expect(alphaRow).toHaveTextContent('001');
    expect(alphaRow).toHaveTextContent('Alpha Design System');
    expect(alphaRow).toHaveTextContent('vercel.com');
    expect(alphaRow).toHaveTextContent('2026');
    // Password-protected row masks year with Protected
    const protectedRow = screen.getByTestId('portfolio-table-row-proj-beta');
    expect(protectedRow).toHaveTextContent('002');
    expect(protectedRow).not.toHaveTextContent('2025');
    expect(protectedRow).toHaveTextContent('Protected');

    // Switch back via Home key
    fireEvent.keyDown(tableBtn, { key: 'Home' });
    expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('portfolio-grid-view')).toBeInTheDocument();

    unmount();

    // Direct ?view=table navigation opens directly in table view
    render(
      <MemoryRouter initialEntries={['/portfolio?view=table']}>
        <PortfolioPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('portfolio-table-view')).toBeInTheDocument();
    });
    expect(screen.getByTestId('view-mode-table')).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows hover and focus thumbnail preview in Table view and unlocks protected rows', async () => {
    render(
      <MemoryRouter initialEntries={['/portfolio?view=table']}>
        <Routes>
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:id" element={<div data-testid="unlocked-detail">Unlocked</div>} />
        </Routes>
      </MemoryRouter>
    );

    const alphaRow = await screen.findByTestId('portfolio-table-row-proj-alpha');
    const betaRow = screen.getByTestId('portfolio-table-row-proj-beta');

    expect(screen.queryByTestId('portfolio-table-preview')).toBeNull();

    // Pointer hover reveals supplemental preview card
    fireEvent.mouseEnter(alphaRow);
    const preview = screen.getByTestId('portfolio-table-preview');
    expect(preview).toHaveAttribute('aria-hidden', 'true');
    expect(preview).toHaveTextContent('Alpha Design System');

    // Hovering protected row switches preview to protected placeholder
    fireEvent.mouseEnter(betaRow);
    expect(screen.getByTestId('portfolio-table-preview')).toHaveTextContent('Beta Secret Portal');

    // Leaving table hides preview
    fireEvent.mouseLeave(alphaRow.closest('tbody')!);
    expect(screen.queryByTestId('portfolio-table-preview')).toBeNull();

    // Keyboard focus on row link also shows preview without moving focus
    const alphaLink = screen.getByRole('link', { name: /View project: Alpha Design System/i });
    fireEvent.focus(alphaLink);
    expect(screen.getByTestId('portfolio-table-preview')).toHaveTextContent('Alpha Design System');

    // Clicking locked row opens PasswordProtectionModal
    fireEvent.click(betaRow);
    const passwordInput = screen.getByLabelText('Enter Password') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'secret-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Access Portfolio' }));

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-detail')).toBeInTheDocument();
    });
  });

  it('opens mobile Filter button popup as native <dialog>, tracks active badge count, and avoids duplicate filter controls', async () => {
    render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <PortfolioPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 projects')).toBeInTheDocument();
    });

    const filterButton = screen.getByTestId('mobile-filter-button');
    expect(filterButton).toHaveClass('md:hidden');
    expect(screen.queryByTestId('mobile-filter-badge')).toBeNull();

    const dialog = screen.getByTestId('mobile-filter-dialog') as HTMLDialogElement;
    expect(dialog).toHaveAttribute('closedby', 'any');
    expect(dialog).not.toHaveAttribute('role');
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(dialog.open).toBe(false);

    // Open mobile filter dialog
    fireEvent.click(filterButton);
    expect(dialog.open).toBe(true);

    // Single-mount strategy keeps only one set of filter controls in the DOM
    expect(screen.getAllByTestId('year-filter-2026')).toHaveLength(1);
    expect(screen.getAllByLabelText('Search projects')).toHaveLength(1);

    const dialogScope = within(dialog);
    fireEvent.click(dialogScope.getByTestId('role-filter-UI/UX Designer'));
    fireEvent.click(dialogScope.getByTestId('tech-option-Figma'));

    expect(screen.getByTestId('mobile-filter-badge')).toHaveTextContent('2');
    expect(dialogScope.getByTestId('mobile-apply-filters')).toHaveTextContent('Show 1 project');

    // Clear all inside modal resets constraints
    fireEvent.click(dialogScope.getByTestId('mobile-clear-filters'));
    expect(screen.queryByTestId('mobile-filter-badge')).toBeNull();
    expect(dialogScope.getByTestId('mobile-apply-filters')).toHaveTextContent('Show 2 projects');

    // Filter by year then apply & close
    fireEvent.click(dialogScope.getByTestId('year-filter-2026'));
    fireEvent.click(dialogScope.getByTestId('mobile-apply-filters'));

    expect(dialog.open).toBe(false);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 2 projects');
    expect(screen.getByTestId('mobile-filter-badge')).toHaveTextContent('1');
    expect(screen.getAllByTestId('year-filter-2026')).toHaveLength(1);
  });

  it('left-aligns all desktop/tablet table headers and cells and preserves mobile container data-col hooks', async () => {
    render(
      <MemoryRouter initialEntries={['/portfolio?view=table']}>
        <PortfolioPage />
      </MemoryRouter>
    );

    const tableView = await screen.findByTestId('portfolio-table-view');
    const columnHeaders = within(tableView).getAllByRole('columnheader');
    expect(columnHeaders.map((header) => header.textContent)).toEqual([
      'No.',
      'Project',
      'Role',
      'Link',
      'Year',
    ]);

    for (const header of columnHeaders) {
      expect(header).toHaveClass('text-left');
      expect(header).not.toHaveClass('text-right');
    }

    const alphaRow = screen.getByTestId('portfolio-table-row-proj-alpha');
    const yearCell = alphaRow.querySelector('td[data-col="year"]');
    expect(yearCell).toHaveClass('text-left');
    expect(yearCell).not.toHaveClass('md:text-right');
    expect(yearCell).not.toHaveClass('text-right');

    // Essential cells expose data-col hooks consumed by @container (width < 640px)
    expect(alphaRow.querySelector('td[data-col="index"]')).toHaveTextContent('001');
    expect(alphaRow.querySelector('th[scope="row"]')).toHaveTextContent('Alpha Design System');
    expect(alphaRow.querySelector('td[data-col="roles"]')).toBeInTheDocument();
    expect(alphaRow.querySelector('td[data-col="link"]')).toBeInTheDocument();
  });
});
