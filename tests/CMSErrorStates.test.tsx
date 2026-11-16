import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'node:module';
import ExperienceManagement from '../src/cms/pages/ExperienceManagement';
import Dashboard from '../src/cms/pages/Dashboard';
import { CMSStorage } from '../src/cms/apiStorage';
import { parseCMSError } from '../src/cms/utils/errorUtils';

const require = createRequire(import.meta.url);
const { handleRouteError } = require('../server/utils/errorHandler');
const ExperienceModel = require('../server/models/Experience');

vi.mock('../src/cms/components/WYSIWYGEditor', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => (
    <textarea
      data-testid="mock-experience-wysiwyg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getExperiences: vi.fn(),
    addExperience: vi.fn(),
    updateExperience: vi.fn(),
    deleteExperience: vi.fn(),
    uploadExperienceLogo: vi.fn(),
    getTechTools: vi.fn(),
    getEducation: vi.fn(),
    getPortfolios: vi.fn(),
    getContacts: vi.fn(),
    getBlogs: vi.fn(),
    getWorkProcesses: vi.fn(),
    getRoles: vi.fn(),
    getSocialLinks: vi.fn(),
  },
}));

vi.mock('../src/cms/auth', () => ({
  AuthService: {
    getSession: vi.fn().mockReturnValue({ email: 'admin@portfolio.com' }),
    isAuthenticated: vi.fn().mockReturnValue(true),
    logout: vi.fn(),
  },
}));

function createMockRes() {
  const res: any = {
    statusCode: 200,
    payload: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.payload = data;
      return this;
    },
  };
  return res;
}

describe('Backend error handler & Experience schema limits', () => {
  it('formats Mongoose ValidationError, duplicate keys, and CastError into structured 400 responses', () => {
    const valRes = createMockRes();
    handleRouteError(valRes, {
      name: 'ValidationError',
      errors: {
        description: { message: 'Description cannot exceed 20000 characters' },
      },
    });
    expect(valRes.statusCode).toBe(400);
    expect(valRes.payload.success).toBe(false);
    expect(valRes.payload.errors).toEqual(['Description cannot exceed 20000 characters']);
    expect(valRes.payload.fieldErrors).toEqual({
      description: 'Description cannot exceed 20000 characters',
    });

    const dupRes = createMockRes();
    handleRouteError(dupRes, {
      code: 11000,
      keyPattern: { title: 1 },
    });
    expect(dupRes.statusCode).toBe(400);
    expect(dupRes.payload.fieldErrors.title).toMatch(/already exists/i);

    const castRes = createMockRes();
    handleRouteError(castRes, {
      name: 'CastError',
      path: '_id',
    });
    expect(castRes.statusCode).toBe(400);
    expect(castRes.payload.message).toBe('Invalid ID format');
  });

  it('allows Experience HTML descriptions over 1000 characters and enforces 20000 character cap', () => {
    const richHtmlOver1000 = `<ul>${'<li><p>Built scalable web experiences and automated deployments.</p></li>'.repeat(25)}</ul>`;
    expect(richHtmlOver1000.length).toBeGreaterThan(1000);

    const validDoc = new ExperienceModel({
      title: 'Web Designer',
      companyName: 'Blossem Group',
      startDate: new Date('2025-10-01'),
      description: richHtmlOver1000,
    });
    expect(validDoc.validateSync()).toBeUndefined();

    const oversizedDoc = new ExperienceModel({
      title: 'Web Designer',
      companyName: 'Blossem Group',
      startDate: new Date('2025-10-01'),
      description: 'a'.repeat(20001),
    });
    const validationErr = oversizedDoc.validateSync();
    expect(validationErr?.errors?.description?.message).toBe(
      'Description cannot exceed 20000 characters'
    );
  });
});

describe('parseCMSError utility', () => {
  it('extracts fieldErrors and validation array details when server returns Validation error', () => {
    const parsed = parseCMSError({
      response: {
        status: 400,
        data: {
          message: 'Validation error',
          errors: ['Description cannot exceed 20000 characters'],
          fieldErrors: { description: 'Description cannot exceed 20000 characters' },
        },
      },
    });

    expect(parsed.message).toContain('Description cannot exceed 20000 characters');
    expect(parsed.fieldErrors.description).toBe('Description cannot exceed 20000 characters');
    expect(parsed.details).toEqual(['Description cannot exceed 20000 characters']);
  });

  it('identifies network failures with a friendly server connection message', () => {
    const parsed = parseCMSError({
      code: 'ERR_NETWORK',
      message: 'Network Error',
    });
    expect(parsed.isNetworkError).toBe(true);
    expect(parsed.message).toMatch(/unable to reach the server/i);
  });
});

describe('CMS Error States - ExperienceManagement & Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays retry banner on load failure, inline required field errors, and backend validation details on save error', async () => {
    vi.mocked(CMSStorage.getExperiences)
      .mockRejectedValueOnce({ code: 'ERR_NETWORK', message: 'Network Error' })
      .mockResolvedValueOnce([
        {
          id: 'exp-1',
          title: 'Web Designer',
          status: 'Current',
          companyName: 'Blossem Group',
          startDate: '2025-10',
          description: '<ul><li><p>Initial role</p></li></ul>',
          logoURL: '',
          order: 0,
          isPublished: true,
        },
      ]);

    render(
      <MemoryRouter>
        <ExperienceManagement />
      </MemoryRouter>
    );

    expect(await screen.findByText(/unable to reach the server/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByText('Web Designer')).toBeInTheDocument();

    // Test client required field error states on Add New Experience
    fireEvent.click(screen.getByRole('button', { name: /add new experience/i }));
    fireEvent.click(screen.getByRole('button', { name: /add experience/i }));

    expect(await screen.findByText('Job title is required.')).toBeInTheDocument();
    expect(screen.getByText('Company name is required.')).toBeInTheDocument();
    expect(screen.getByText('Start date is required.')).toBeInTheDocument();
    expect(screen.getByText('Description is required.')).toBeInTheDocument();

    // Cancel and test editing existing item with backend validation error
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

    vi.mocked(CMSStorage.updateExperience).mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: 'Validation error',
          errors: ['Custom description validation error from server'],
          fieldErrors: {
            description: 'Custom description validation error from server',
          },
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(
      await screen.findByText(/validation failed: custom description validation error from server/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText('Custom description validation error from server')
    ).toBeInTheDocument();
  });

  it('displays partial collection load warnings and Retry action on CMS Dashboard', async () => {
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue([]);
    vi.mocked(CMSStorage.getEducation).mockResolvedValue([]);
    vi.mocked(CMSStorage.getPortfolios).mockRejectedValueOnce(new Error('DB timeout'));
    vi.mocked(CMSStorage.getContacts).mockResolvedValue([]);
    vi.mocked(CMSStorage.getBlogs).mockResolvedValue([]);
    vi.mocked(CMSStorage.getExperiences).mockRejectedValueOnce(new Error('DB timeout'));
    vi.mocked(CMSStorage.getWorkProcesses).mockResolvedValue([]);
    vi.mocked(CMSStorage.getRoles).mockResolvedValue([]);
    vi.mocked(CMSStorage.getSocialLinks).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/some cms collections failed to load: portfolios, experiences\./i)
    ).toBeInTheDocument();

    vi.mocked(CMSStorage.getPortfolios).mockResolvedValueOnce([]);
    vi.mocked(CMSStorage.getExperiences).mockResolvedValueOnce([]);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-error-banner')).toBeNull();
    });
  });
});

