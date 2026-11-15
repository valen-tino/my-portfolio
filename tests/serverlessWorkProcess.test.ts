import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const WorkProcess = require('../server/models/WorkProcess');
const User = require('../server/models/User');
const skillMigration = require('../server/utils/skillMigration');
const DEFAULT_WORK_PROCESS_STEPS = require('../server/data/defaultWorkProcessSteps');

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

describe('Serverless /api/work-process routes', () => {
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

  it('lists published work process steps sorted by order on GET /api/work-process?published=true', async () => {
    const mockSteps = [
      { _id: '1', title: 'Empathize', description: 'Research users.', order: 1, isPublished: true },
      { _id: '5', title: 'Development', description: 'Spec-driven build.', order: 5, isPublished: true },
    ];
    const sortMock = vi.fn().mockResolvedValue(mockSteps);
    const findSpy = vi.spyOn(WorkProcess, 'find').mockReturnValue({ sort: sortMock } as any);

    const { status, data } = await requestJson(app, 'GET', '/api/work-process?published=true');

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockSteps);
    expect(findSpy).toHaveBeenCalledWith({ isPublished: { $ne: false } });
    expect(sortMock).toHaveBeenCalledWith({ order: 1, createdAt: 1 });
  });

  it('rejects unauthenticated mutations on POST /api/work-process', async () => {
    const { status, data } = await requestJson(app, 'POST', '/api/work-process', {
      body: { title: 'Test', description: 'Verify' },
    });

    expect(status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('supports authenticated create, update, delete, and seed operations', async () => {
    // POST create
    vi.spyOn(WorkProcess, 'findOne').mockResolvedValue(null as any);
    vi.spyOn(WorkProcess.prototype, 'save').mockImplementation(async function (this: any) {
      return this;
    });

    const createRes = await requestJson(app, 'POST', '/api/work-process', {
      token: adminToken,
      body: {
        title: 'Development',
        description: 'Spec-Driven Development workflow.',
        order: 5,
        isPublished: true,
      },
    });
    expect(createRes.status).toBe(201);
    expect(createRes.data.success).toBe(true);
    expect(createRes.data.data.title).toBe('Development');
    expect(createRes.data.data.order).toBe(5);

    // PUT update
    const existingDoc: any = {
      _id: 'step-5',
      title: 'Development',
      description: 'Old description',
      order: 5,
      isPublished: true,
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(WorkProcess, 'findById').mockResolvedValue(existingDoc);

    const updateRes = await requestJson(app, 'PUT', '/api/work-process/step-5', {
      token: adminToken,
      body: { description: 'PRD -> ERD -> Design Brief -> Production', isPublished: false },
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.data.success).toBe(true);
    expect(existingDoc.description).toBe('PRD -> ERD -> Design Brief -> Production');
    expect(existingDoc.isPublished).toBe(false);
    expect(existingDoc.save).toHaveBeenCalled();

    // DELETE
    vi.spyOn(WorkProcess, 'findByIdAndDelete').mockResolvedValue(existingDoc as any);
    const deleteRes = await requestJson(app, 'DELETE', '/api/work-process/step-5', {
      token: adminToken,
    });
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.data.success).toBe(true);

    // POST /seed when empty
    vi.spyOn(WorkProcess, 'countDocuments').mockResolvedValue(0 as any);
    const insertSpy = vi
      .spyOn(WorkProcess, 'insertMany')
      .mockResolvedValue(DEFAULT_WORK_PROCESS_STEPS as any);

    const seedRes = await requestJson(app, 'POST', '/api/work-process/seed', {
      token: adminToken,
      body: {},
    });
    expect(seedRes.status).toBe(201);
    expect(seedRes.data.success).toBe(true);
    expect(seedRes.data.data).toHaveLength(6);
    expect(insertSpy).toHaveBeenCalledWith(DEFAULT_WORK_PROCESS_STEPS);
  });
});
