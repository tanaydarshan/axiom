import { NextRequest } from 'next/server';

export function isInternalAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const expectedKey = process.env.INTERNAL_API_KEY;
  if (!expectedKey) return false;
  return authHeader === `Bearer ${expectedKey}`;
}
