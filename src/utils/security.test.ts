import test from 'node:test';
import assert from 'node:assert/strict';
import { isServiceRoleKey } from '../lib/supabase.ts';

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
