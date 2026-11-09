// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import http from 'http';
import mongoose from 'mongoose';

// Mock mongoose connection so api/serverless.js does not attempt external network requests
vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose as any);
Object.defineProperty(mongoose.connection, 'readyState', {
  value: 1,
  configurable: true,
  writable: true
});

// Import Blog model and mock query methods
// @ts-ignore - CommonJS module in tests
import Blog from '../server/models/Blog';
// @ts-ignore - CommonJS module in tests
import User from '../server/models/User';
// @ts-ignore - CommonJS module in tests
import * as skillMigration from '../server/utils/skillMigration';

vi.spyOn(User, 'findOne').mockResolvedValue({ email: 'admin@example.com' } as any);
vi.spyOn(skillMigration, 'syncAllPortfolioSkills').mockResolvedValue({ createdCount: 0 } as any);

vi.spyOn(Blog, 'find').mockReturnValue({
  sort: vi.fn().mockResolvedValue([
    {
      _id: 'blog123',
      title: 'Serverless Parity Test Post',
      slug: 'serverless-parity-test-post',
      desc: 'Test description',
      content: '<p>Test content</p>',
      category: 'Tech',
      isPublished: true,
      date: '2026-11-10'
    }
  ])
} as any);

// Import serverless Express app after mocks are in place
// @ts-ignore - CommonJS module in tests
import app from '../api/serverless';

describe('Vercel Serverless Express Router Parity - Blog Endpoints', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  });

  it('handles GET /api/blog successfully without returning 404', async () => {
    const res = await fetch(`${baseUrl}/api/blog?published=true`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].title).toBe('Serverless Parity Test Post');
  });

  it('handles GET /api/blogs plural alias route successfully', async () => {
    const res = await fetch(`${baseUrl}/api/blogs`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('handles preflight OPTIONS request for /api/blog with CORS headers', async () => {
    const res = await fetch(`${baseUrl}/api/blog`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });

    expect([200, 204]).toContain(res.status);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');
  });

  it('intercepts unauthenticated POST /api/blog with 401 instead of 404', async () => {
    const res = await fetch(`${baseUrl}/api/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Unauthorized Test Post'
      })
    });

    // Proves that the route is mounted and handled by authMiddleware rather than 404 route not found
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns 404 for genuinely unregistered API routes', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-route-endpoint-xyz`);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain('not found');
  });
});

