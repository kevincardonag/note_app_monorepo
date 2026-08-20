import { describe, it, expect } from 'vitest';
import { middleware } from '../middleware';
import { NextRequest } from 'next/server';

describe('middleware', () => {
  it('redirects unauthenticated users from protected routes to /login', () => {
    const req = new NextRequest('http://localhost:3000/');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('redirects authenticated users away from /login to /', () => {
    const req = new NextRequest('http://localhost:3000/login');
    req.cookies.set('access_token', 'fake-token');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('redirects authenticated users away from /signup to /', () => {
    const req = new NextRequest('http://localhost:3000/signup');
    req.cookies.set('access_token', 'fake-token');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('allows unauthenticated users to access /login', () => {
    const req = new NextRequest('http://localhost:3000/login');
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows authenticated users to access protected routes', () => {
    const req = new NextRequest('http://localhost:3000/');
    req.cookies.set('access_token', 'fake-token');
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
