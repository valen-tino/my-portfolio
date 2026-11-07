import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../src/App';
import { CMSStorage } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getAbout: vi.fn().mockResolvedValue({ description: 'Test about', imageURL: 'me.png' }),
    getTechTools: vi.fn().mockResolvedValue([]),
    getRoles: vi.fn().mockResolvedValue([]),
    getEducation: vi.fn().mockResolvedValue([]),
    getPortfolios: vi.fn().mockResolvedValue([]),
    getExperiences: vi.fn().mockResolvedValue([])
  }
}));

describe('App Component - CursorInverter Removal', () => {
  it('renders public site without any CursorInverter or CursorToggle elements', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(CMSStorage.getPortfolios).toHaveBeenCalled();
    });

    expect(container.querySelector('.cursor-inverter')).toBeNull();
    expect(container.querySelector('[data-cursor-inverter]')).toBeNull();
    expect(localStorage.getItem('cursorInverterEnabled')).toBeNull();
  });
});
