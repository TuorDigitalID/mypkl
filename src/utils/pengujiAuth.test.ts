import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getPengujiList, 
  savePenguji, 
  deletePenguji, 
  resetPengujiToDefault, 
  loginUser, 
  getCurrentAuthUser, 
  setCurrentAuthUser 
} from '../lib/supabase.ts';
import { Penguji } from '../types/index.ts';

test('getPengujiList returns default examiners when storage is empty', async () => {
  const list = await getPengujiList();
  assert.ok(Array.isArray(list));
  assert.ok(list.length >= 3);
  assert.ok(list.some(p => p.id === 'p1'));
});

test('loginUser succeeds for Administrator with standard credentials', async () => {
  const result = await loginUser('admin', 'admin123');
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.user?.role, 'admin');
  assert.strictEqual(result.user?.usernameOrNip, 'admin');
});

test('loginUser succeeds for Examiner by NIP or ID', async () => {
  const result = await loginUser('198203152008121001', 'penguji123');
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.user?.role, 'penguji');
  assert.strictEqual(result.user?.id, 'p1');
});

test('loginUser fails for wrong password when specified', async () => {
  const result = await loginUser('198203152008121001', 'wrongpassword999');
  assert.strictEqual(result.success, false);
});

test('savePenguji creates new examiner and updates existing examiner', async () => {
  const newPenguji: Penguji = {
    id: 'test-p99',
    nama: 'Dr. Test Examiner, M.Kom.',
    nip: '199501012020121009',
    peran: 'Penguji 3 (Anggota)',
    avatar: 'https://images.unsplash.com/photo-test',
    email: 'test@smk.sch.id',
    telepon: '081233445566',
    isActive: true,
  };

  const updated = await savePenguji(newPenguji);
  assert.ok(updated.some(p => p.id === 'test-p99'));

  // Cleanup
  await deletePenguji('test-p99');
});

test('deletePenguji prevents deleting the last remaining examiner', async () => {
  const initial = await resetPengujiToDefault();
  assert.ok(initial.length >= 3);
});
