import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const SocialLink = require('../server/models/SocialLink');
const User = require('../server/models/User');
const skillMigration = require('../server/utils/skillMigration');
const DEFAULT_SOCIAL_LINKS = require('../server/data/defaultSocialLinks');

vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose as any);
vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'admin-id', email: 'admin@test.com' } as any);
vi.spyOn(skillMigration, 'syncAllPortfolioSkills').mockResolvedValue(undefined as any);
const app = require('../api/serverless.js');

const FALLBACK_JWT_SECRET =
  '4Z3lRYx7O5uKGZj2MICiWgVaYLv5RVy5uFwQFdi2GHqA2fEwTn32KUgINetfR1hY';

async function requestJson(
  expressApp: any,
  method: string,
  path: string,
  options: { body?: Record<string, unknown>; token?: string } = {}
) {
  const server = http.createServer(expressApp);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind test server');
    }

    const headers: Record<string, string> = {};
    let payload: string | undefined;

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(options.body);
    }
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const res = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
      body: payload,
    });
    const data = await res.json();
    return { status: res.status, data };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe('Serverless /api/social-links routes', () => {
  let adminToken: string;

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose as any);
    Object.defineProperty(mongoose.connection, 'readyState', {
      configurable: true,
      get: () => 1,
    });

    vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'admin-id', email: 'admin@test.com' } as any);
    vi.spyOn(User, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: 'admin-id',
        email: 'admin@test.com',
        role: 'admin',
        isActive: true,
      }),
    } as any);
    vi.spyOn(skillMigration, 'syncAllPortfolioSkills').mockResolvedValue(undefined as any);

    const jwtSecret = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
    adminToken = jwt.sign({ userId: 'admin-id' }, jwtSecret, { expiresIn: '1h' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists published social links sorted by order on GET /api/social-links?published=true', async () => {
    const mockLinks = [
      { _id: '1', name: 'Email', url: 'mailto:valentinojehaut@gmail.com', icon: 'mail', order: 1, isPublished: true },
      { _id: '2', name: 'GitHub', url: 'https://github.com', icon: 'github', order: 2, isPublished: true },
    ];
    const sortMock = vi.fn().mockResolvedValue(mockLinks);
    const findSpy = vi.spyOn(SocialLink, 'find').mockReturnValue({ sort: sortMock } as any);

    const { status, data } = await requestJson(app, 'GET', '/api/social-links?published=true');

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockLinks);
    expect(findSpy).toHaveBeenCalledWith({ isPublished: { $ne: false } });
    expect(sortMock).toHaveBeenCalledWith({ order: 1, createdAt: 1 });
  });

  it('rejects unauthenticated mutations on POST /api/social-links', async () => {
    const { status, data } = await requestJson(app, 'POST', '/api/social-links', {
      body: { name: 'Dribbble', url: 'https://dribbble.com' },
    });

    expect(status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('supports authenticated create, update, delete, and seed operations', async () => {
    vi.spyOn(SocialLink, 'findOne').mockReturnValue({
      sort: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(SocialLink.prototype, 'save').mockImplementation(async function (this: any) {
      return this;
    });

    const createRes = await requestJson(app, 'POST', '/api/social-links', {
      token: adminToken,
      body: {
        name: 'Dribbble',
        handle: '@valen',
        url: 'https://dribbble.com/valen',
        actionLabel: 'View work',
        icon: 'dribbble',
        order: 4,
        isPublished: true,
      },
    });
    expect(createRes.status).toBe(201);
    expect(createRes.data.success).toBe(true);
    expect(createRes.data.data.name).toBe('Dribbble');
    expect(createRes.data.data.order).toBe(4);

    const existingDoc: any = {
      _id: 'link-4',
      name: 'Dribbble',
      handle: '@valen',
      url: 'https://dribbble.com/valen',
      actionLabel: 'View work',
      icon: 'dribbble',
      order: 4,
      isPublished: true,
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(SocialLink, 'findById').mockResolvedValue(existingDoc);

    const updateRes = await requestJson(app, 'PUT', '/api/social-links/link-4', {
      token: adminToken,
      body: { url: 'https://dribbble.com/valentino', isPublished: false },
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.data.success).toBe(true);
    expect(existingDoc.url).toBe('https://dribbble.com/valentino');
    expect(existingDoc.isPublished).toBe(false);
    expect(existingDoc.save).toHaveBeenCalled();

    vi.spyOn(SocialLink, 'findByIdAndDelete').mockResolvedValue(existingDoc as any);
    const deleteRes = await requestJson(app, 'DELETE', '/api/social-links/link-4', {
      token: adminToken,
    });
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.data.success).toBe(true);

    vi.spyOn(SocialLink, 'countDocuments').mockResolvedValue(0 as any);
    const insertSpy = vi
      .spyOn(SocialLink, 'insertMany')
      .mockResolvedValue(DEFAULT_SOCIAL_LINKS as any);

    const seedRes = await requestJson(app, 'POST', '/api/social-links/seed', {
      token: adminToken,
      body: {},
    });
    expect(seedRes.status).toBe(201);
    expect(seedRes.data.success).toBe(true);
    expect(seedRes.data.data).toHaveLength(3);
    expect(insertSpy).toHaveBeenCalledWith(DEFAULT_SOCIAL_LINKS);
  });
});

