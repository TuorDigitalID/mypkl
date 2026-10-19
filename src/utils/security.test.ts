import test from 'node:test';
import assert from 'node:assert/strict';
import { isServiceRoleKey, isValidUUID } from '../lib/supabase.ts';

test('isServiceRoleKey identifies service_role vs anon public keys', () => {
  // Sample JWT with role: "anon"
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.signature';
  assert.equal(isServiceRoleKey(anonKey), false);

  // Sample JWT with role: "service_role"
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UifQ.signature';
  assert.equal(isServiceRoleKey(serviceRoleKey), true);

  // Invalid strings or empty keys should safely return false without throwing
  assert.equal(isServiceRoleKey(''), false);
  assert.equal(isServiceRoleKey('invalid-random-string'), false);
});

test('isValidUUID correctly validates standard UUIDs vs dummy IDs', () => {
  assert.equal(isValidUUID('550e8400-e29b-41d4-a716-446655440000'), true);
  assert.equal(isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), true);
  assert.equal(isValidUUID('ms-1'), false);
  assert.equal(isValidUUID('ms-171829102-1'), false);
  assert.equal(isValidUUID(''), false);
});
