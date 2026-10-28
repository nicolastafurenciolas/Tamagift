// Pruebas de la partida copiada al servidor (cloudSave.js).
//   node src/cloudSave.test.mjs

import assert from 'node:assert/strict';
import { CloudSync, resolveSave, loadSyncMeta } from './cloudSave.js';

let passed = 0;
const queue = [];
const test = (name, fn) => queue.push([name, fn]);
const tick = (ms = 5) => new Promise((r) => setTimeout(r, ms));

// Un servidor de mentira con las mismas reglas que backend/main.py.
function fakeServer() {
  const srv = { row: null, online: true, pushes: 0 };
  srv.api = {
    fetchSave: async () => {
      if (!srv.online) return null;
      return srv.row ? JSON.parse(JSON.stringify(srv.row)) : { data: null, rev: 0, saved_at: 0 };
    },
    pushSave: async (slug, { data, rev, savedAt }) => {
      if (!srv.online) return null;
      srv.pushes++;
      if (srv.row && srv.row.rev !== rev) return { conflict: true, ...JSON.parse(JSON.stringify(srv.row)) };
      srv.row = { data: JSON.parse(JSON.stringify(data)), rev: (srv.row ? rev : 0) + 1, saved_at: savedAt };
      return { ok: true, rev: srv.row.rev, saved_at: savedAt };
    },
  };
  return srv;
}
function memStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}
function device(srv, { clock, visible } = {}) {
  const dev = { storage: memStorage(), remote: [], visible: true, t: 1000 };
  dev.sync = () => new CloudSync('abc', {
    api: srv.api, storage: dev.storage, throttleMs: 0, minDelayMs: 0,
    now: clock || (() => dev.t), isVisible: visible || (() => dev.visible),
    onRemote: (s) => dev.remote.push(s),
  });
  return dev;
}

test('un celular nuevo recupera la partida del servidor', async () => {
  const srv = fakeServer();
  srv.row = { data: { coins: 500, ownedWear: ['cabeza:moño'] }, rev: 4, saved_at: 900 };
  const dev = device(srv);
  const s = dev.sync();
  const chosen = await s.start({ coins: 0 }, false);
  assert.equal(chosen.coins, 500);
  assert.deepEqual(loadSyncMeta('abc', false, dev.storage), { rev: 4, dirty: false, savedAt: 900 });
  assert.equal(srv.pushes, 0, 'no vuelve a subir lo que acaba de bajar');
});

test('una partida de antes (solo en el celular) se sube sola', async () => {
  const srv = fakeServer();
  const dev = device(srv);
  const chosen = await dev.sync().start({ coins: 120 }, true);
  assert.equal(chosen.coins, 120);
  await tick();
  assert.deepEqual(srv.row.data, { coins: 120 });
  assert.equal(srv.row.rev, 1);
});

test('lo que se juega se sube, y no se sube nada si no cambió', async () => {
  const srv = fakeServer();
  const dev = device(srv);
  const s = dev.sync();
  await s.start({ coins: 0 }, false);
  await tick();
  const before = srv.pushes;
  dev.t = 2000;
  s.changed({ coins: 30 });
  await tick(20);
  assert.equal(srv.row.data.coins, 30);
  assert.equal(srv.pushes, before + 1);
  assert.equal(loadSyncMeta('abc', false, dev.storage).dirty, false);
  await s.flush();
  assert.equal(srv.pushes, before + 1);
});

test('con la pestaña escondida solo pasa el tiempo: no cuenta como cambio', async () => {
  const srv = fakeServer();
  srv.row = { data: { coins: 10 }, rev: 1, saved_at: 500 };
  const dev = device(srv);
  const s = dev.sync();
  await s.start({ coins: 10 }, false);
  dev.visible = false;
  s.changed({ coins: 10, vitals: { hunger: 40 } });
  await tick(20);
  assert.equal(srv.pushes, 0);
  assert.equal(loadSyncMeta('abc', false, dev.storage).dirty, false);
});

test('al volver a la pestaña trae lo que se jugó en el otro celular', async () => {
  const srv = fakeServer();
  const a = device(srv);
  const b = device(srv);
  const sa = a.sync();
  await sa.start({ coins: 5 }, true);
  await tick();
  const sb = b.sync();
  const got = await sb.start({ coins: 0 }, false);
  assert.equal(got.coins, 5);
  b.t = 5000;
  sb.changed({ coins: 80 });
  await tick(20);
  assert.equal(srv.row.data.coins, 80);
  await sa.pull();
  assert.equal(a.remote.length, 1);
  assert.equal(a.remote[0].coins, 80);
});

test('si los dos cambiaron, gana el cambio más reciente', async () => {
  const srv = fakeServer();
  srv.row = { data: { coins: 50 }, rev: 3, saved_at: 3000 };
  const meta = { rev: 2, dirty: true, savedAt: 4000 };
  assert.deepEqual(resolveSave(meta, srv.row, { coins: 1 }), { use: 'local', push: true });
  assert.deepEqual(resolveSave({ ...meta, savedAt: 2000 }, srv.row, { coins: 999 }), { use: 'remote', push: false });
  // sin hora: la que tiene más jugado
  assert.equal(resolveSave({ rev: 0, dirty: true, savedAt: 0 }, srv.row, { coins: 900 }).use, 'local');
  assert.equal(resolveSave({ rev: 0, dirty: true, savedAt: 0 }, srv.row, { coins: 10 }).use, 'remote');
});

test('un choque al subir: se reintenta sobre la versión nueva si la mía es más nueva', async () => {
  const srv = fakeServer();
  srv.row = { data: { coins: 1 }, rev: 1, saved_at: 100 };
  const dev = device(srv);
  const s = dev.sync();
  await s.start({ coins: 1 }, false);
  srv.row = { data: { coins: 2 }, rev: 2, saved_at: 150 };   // otro guardó entre medio
  dev.t = 9000;
  s.changed({ coins: 70 });
  await tick(20);
  assert.equal(srv.row.data.coins, 70);
  assert.equal(srv.row.rev, 3);
  assert.equal(dev.remote.length, 0);
});

test('sin conexión no se pierde nada: queda pendiente', async () => {
  const srv = fakeServer();
  const dev = device(srv);
  const s = dev.sync();
  await s.start({ coins: 0 }, false);
  await tick();
  srv.online = false;
  dev.t = 3000;
  s.changed({ coins: 44 });
  await tick(10);
  s.stop();
  assert.equal(loadSyncMeta('abc', false, dev.storage).dirty, true);
  // al abrir de nuevo con conexión, se sube
  srv.online = true;
  const s2 = dev.sync();
  await s2.start({ coins: 44 }, true);
  await tick();
  assert.equal(srv.row.data.coins, 44);
});

test('un servidor que no tiene esta función: se deja de intentar', async () => {
  const srv = fakeServer();
  let tries = 0;
  srv.api.pushSave = async () => { tries++; return { failed: 404 }; };
  const dev = device(srv);
  const s = dev.sync();
  await s.start({ coins: 3 }, true);
  dev.t = 4000;
  s.changed({ coins: 4 });
  await tick(30);
  assert.equal(tries, 1);
  assert.equal(s.stopped, true);
});

test('si el servidor perdió datos, se vuelven a subir', () => {
  assert.deepEqual(resolveSave({ rev: 7, dirty: false, savedAt: 1 }, { data: { coins: 1 }, rev: 2, saved_at: 1 }, {}), { use: 'local', push: true });
  assert.deepEqual(resolveSave({ rev: 7, dirty: false, savedAt: 1 }, { data: null, rev: 0, saved_at: 0 }, {}), { use: 'local', push: true });
  assert.deepEqual(resolveSave({ rev: 7, dirty: false, savedAt: 1 }, null, {}), { use: 'local', push: false });
});

for (const [name, fn] of queue) {
  try { await fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}
console.log(`\n${passed}/${queue.length} pruebas de la partida en el servidor`);
