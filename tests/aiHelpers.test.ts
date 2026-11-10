import { describe, it, expect } from 'vitest';
import {
  AI_MODEL_CONFIG,
  validateProjectDetailsForRewriting,
  validateTextForPortfolioCreation,
  parseAIPortfolioResponse,
  separateTechnologies
} from '../src/utils/aiHelpers';
import { OPENCODE_AI_CONFIG } from '../src/services/ai';

describe('AI Helpers & Opencode Go Configuration', () => {
  it('configures Opencode Go deepseek-v4.1-flash model without exposing static API keys in client bundles', () => {
    // Client-side configs must not expose static API keys
    expect(AI_MODEL_CONFIG).not.toHaveProperty('apiKey');
    expect(OPENCODE_AI_CONFIG).not.toHaveProperty('apiKey');

    expect(AI_MODEL_CONFIG.model).toBe('deepseek-v4.1-flash');
    expect(AI_MODEL_CONFIG.maxTokens).toBe(8192);
    expect(AI_MODEL_CONFIG.envKeyName).toBe('DEEPSEEK_API_KEY');
    expect(AI_MODEL_CONFIG.envBaseUrlName).toBe('DEEPSEEK_BASE_URL');

    expect(OPENCODE_AI_CONFIG.model).toBe('deepseek-v4.1-flash');
    expect(OPENCODE_AI_CONFIG.maxTokens).toBe(8192);
  });

  it('validates project details length after stripping HTML tags', () => {
    expect(validateProjectDetailsForRewriting('<p>Short</p>').isValid).toBe(false);
    expect(
      validateProjectDetailsForRewriting('<p>This is a detailed project overview with sufficient text for AI rewriting.</p>')
        .isValid
    ).toBe(true);
  });

  it('validates text description for portfolio creation', () => {
    expect(validateTextForPortfolioCreation('Too short').isValid).toBe(false);
    const validText = 'Built a full-stack e-commerce web application using React, TypeScript, Express, and MongoDB.';
    expect(validateTextForPortfolioCreation(validText).isValid).toBe(true);
  });

  it('parses AI JSON response and separates matched/unmatched technologies', () => {
    const rawJson = JSON.stringify({
      title: 'Portfolio Project',
      desc: 'Short summary',
      projectDetails: '<h2>Overview</h2><p>Details</p>',
      linkTo: 'https://example.com',
      tech: ['React JS', 'GraphQL'],
      roles: ['Fullstack Developer']
    });

    const parsed = parseAIPortfolioResponse(rawJson);
    expect(parsed).not.toBeNull();
    expect(parsed?.title).toBe('Portfolio Project');

    const { matched, unmatched } = separateTechnologies(parsed!.tech, [{ title: 'React JS' }]);
    expect(matched).toEqual(['React JS']);
    expect(unmatched).toEqual(['GraphQL']);
  });
});

