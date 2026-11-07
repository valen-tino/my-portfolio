import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../src/App';
import { CMSStorage } from '../src/cms/apiStorage';
import apiService from '../src/services/api';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getAbout: vi.fn().mockResolvedValue({ description: 'Test about', imageURL: 'me.png' }),
    getTechTools: vi.fn().mockResolvedValue([{ id: '1', title: 'React', imageURL: 'react.svg' }]),
    getRoles: vi.fn().mockResolvedValue([]),
    getEducation: vi.fn().mockResolvedValue([
      {
        id: 'edu-1',
        title: 'B.Sc Computer Science',
        institution: 'Test University',
        startDate: '2020-09',
        endDate: '2024-06',
        description: 'Computer Science Degree'
      }
    ]),
    getPortfolios: vi.fn().mockResolvedValue([]),
    getExperiences: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../src/services/api', () => ({
  default: {
    getExperiences: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'exp-1',
          title: 'Software Engineer',
          status: 'Current',
          companyName: 'Tech Corp',
          startDate: '2024-01',
          description: 'Building software',
          logoURL: ''
        }
      ]
    })
  }
}));

describe('App Component - CursorInverter Removal & Home Page Hierarchy', () => {
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

  it('renders Home sections in the exact requested hierarchy and aligns Education & Experience carousel sizes', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiService.getExperiences).toHaveBeenCalled();
      expect(CMSStorage.getEducation).toHaveBeenCalled();
    });

    const sectionIds = Array.from(container.querySelectorAll('section[id], div#home'))
      .map((el) => el.id)
      .filter(Boolean);

    expect(sectionIds).toEqual([
      'home',
      'aboutme',
      'tools',
      'portfolio',
      'experience',
      'education',
      'contact'
    ]);

    const experienceSlide = container.querySelector('#experience .flex-none.w-96');
    const educationSlide = container.querySelector('#education .flex-none.w-96');
    expect(experienceSlide).not.toBeNull();
    expect(educationSlide).not.toBeNull();
  });
});
