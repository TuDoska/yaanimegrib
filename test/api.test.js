// Інтеграційні тести API та сокетів: npm test
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'yag-test-'));
process.env.NODE_ENV = 'test';

const { createApp } = require('../server/index');
const { io: ioClient } = require('socket.io-client');

function client(base) {
  let cookie = '';
  const call = async (method, url, body) => {
    const res = await fetch(base + url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, body: await res.json().catch(() => null) };
  };
  return {
    get: (u) => call('GET', u), post: (u, b) => call('POST', u, b),
    patch: (u, b) => call('PATCH', u, b), del: (u) => call('DELETE', u),
    get cookie() { return cookie; },
  };
}

const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));
const emitAck = (socket, event, data) => new Promise((resolve) => socket.emit(event, data, resolve));

(async () => {
  const { server } = await createApp();
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const results = [];
  const test = async (name, fn) => {
    try { await fn(); results.push(['✔', name]); } catch (e) { results.push(['✘', name, e.message]); }
  };

  const admin = client(base);
  const alice = client(base);
  const bob = client(base);

  await test('реєстрація: перший користувач — адмін', async () => {
    const r = await admin.post('/api/auth/register', { username: 'GribAdmin', password: 'secret123', lang: 'uk' });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.user.role, 'admin');
  });

  await test('реєстрація: валідація і дублікати', async () => {
    assert.strictEqual((await alice.post('/api/auth/register', { username: 'a', password: 'secret123' })).status, 400);
    assert.strictEqual((await alice.post('/api/auth/register', { username: 'alice', password: '123' })).status, 400);
    assert.strictEqual((await alice.post('/api/auth/register', { username: 'alice', password: 'secret123' })).status, 201);
    assert.strictEqual((await bob.post('/api/auth/register', { username: 'ALICE', password: 'secret123' })).status, 409);
    const r = await bob.post('/api/auth/register', { username: 'bob', password: 'secret123' });
    assert.strictEqual(r.body.user.role, 'user');
  });

  await test('вхід, me, мова', async () => {
    const c = client(base);
    assert.strictEqual((await c.post('/api/auth/login', { username: 'alice', password: 'wrong!!' })).status, 401);
    assert.strictEqual((await c.post('/api/auth/login', { username: 'Alice', password: 'secret123' })).status, 200);
    assert.strictEqual((await c.get('/api/auth/me')).body.user.username, 'alice');
    assert.strictEqual((await c.patch('/api/auth/me', { lang: 'en' })).body.user.lang, 'en');
    await c.post('/api/auth/logout');
  });

  await test('обране: додати, синхронізувати, видалити', async () => {
    assert.strictEqual((await client(base).get('/api/favorites')).status, 401);
    await alice.post('/api/favorites', { id: 21, title: 'Test', image: 'https://x/y.jpg', score: 8.7, episodes: 1000 });
    await alice.post('/api/favorites', { id: 21, title: 'Test' });
    const sync = await alice.post('/api/favorites/sync', { items: [{ id: 5, title: 'A' }, { id: 21 }, { id: -1 }] });
    assert.strictEqual(sync.body.added, 1);
    let list = await alice.get('/api/favorites');
    assert.strictEqual(list.body.items.length, 2);
    await alice.del('/api/favorites/21');
    list = await alice.get('/api/favorites');
    assert.deepStrictEqual(list.body.items.map((i) => i.id), [5]);
  });

  let reviewId;
  await test('відгуки: створення, оновлення, середня оцінка', async () => {
    assert.strictEqual((await alice.post('/api/reviews/21', { rating: 11, text: 'ok ok' })).status, 400);
    const r = await alice.post('/api/reviews/21', { rating: 9, text: 'Чудове аніме' });
    assert.strictEqual(r.status, 201);
    reviewId = r.body.review.id;
    await alice.post('/api/reviews/21', { rating: 10, text: 'Найкраще аніме' });
    await bob.post('/api/reviews/21', { rating: 6, text: 'Спам спам спам' });
    const list = await client(base).get('/api/reviews/21');
    assert.strictEqual(list.body.count, 2);
    assert.strictEqual(list.body.average, 8);
  });

  let roomId;
  await test('кімнати: валідація YouTube і створення', async () => {
    assert.strictEqual((await alice.post('/api/rooms', { name: 'Вечір', url: 'https://example.com/video' })).status, 400);
    const r = await alice.post('/api/rooms', { name: 'Вечірній перегляд', url: 'https://youtu.be/dQw4w9WgXcQ?t=5' });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.room.videoId, 'dQw4w9WgXcQ');
    roomId = r.body.room.id;
    assert.strictEqual((await client(base).get('/api/rooms')).body.items.length, 1);
  });

  await test('сокети: синхронізація, чат, гість без чату, кік', async () => {
    const sa = ioClient(base, { extraHeaders: { Cookie: alice.cookie }, transports: ['websocket'] });
    const sb = ioClient(base, { extraHeaders: { Cookie: bob.cookie }, transports: ['websocket'] });
    const sg = ioClient(base, { transports: ['websocket'] });

    const ja = await emitAck(sa, 'join', { roomId });
    assert.strictEqual(ja.room.name, 'Вечірній перегляд');
    assert.strictEqual(ja.canModerate, true);
    const jb = await emitAck(sb, 'join', { roomId });
    assert.strictEqual(jb.canModerate, false);
    await emitAck(sg, 'join', { roomId });

    const synced = once(sb, 'sync');
    sa.emit('control', { action: 'play', time: 42 });
    const s = await synced;
    assert.strictEqual(s.playing, true);
    assert.ok(s.time >= 42);

    const got = once(sg, 'chat');
    assert.deepStrictEqual(await emitAck(sb, 'chat', { text: '  Привіт!  ' }), { ok: true });
    assert.strictEqual((await got).text, 'Привіт!');
    assert.strictEqual((await emitAck(sb, 'chat', { text: 'швидко' })).error, 'too_fast');
    assert.strictEqual((await emitAck(sg, 'chat', { text: 'гість' })).error, 'auth_required');

    // Режим «керує лише власник»
    sa.emit('settings', { hostOnly: true });
    await once(sb, 'settings');
    let leaked = false;
    sa.once('sync', () => { leaked = true; });
    sb.emit('control', { action: 'pause', time: 1 });
    await new Promise((r) => setTimeout(r, 200));
    assert.strictEqual(leaked, false);

    const kicked = once(sb, 'kicked');
    sa.emit('kick', { userId: jb.me.id });
    await kicked;
    assert.strictEqual((await emitAck(sb, 'join', { roomId })).error, 'kicked');
    [sa, sb, sg].forEach((s) => s.close());
  });

  await test('скарги та модерація', async () => {
    const msgs = await new Promise((resolve) => {
      const s = ioClient(base, { extraHeaders: { Cookie: alice.cookie }, transports: ['websocket'] });
      s.emit('join', { roomId }, (r) => { s.close(); resolve(r.messages); });
    });
    assert.strictEqual(msgs.length, 1);

    const bobReview = (await client(base).get('/api/reviews/21')).body.items.find((r) => r.username === 'bob');
    assert.strictEqual((await alice.post('/api/reports', { targetType: 'review', targetId: bobReview.id, reason: 'spam' })).status, 201);
    assert.strictEqual((await alice.post('/api/reports', { targetType: 'message', targetId: msgs[0].id, reason: 'insult' })).status, 201);

    assert.strictEqual((await alice.get('/api/admin/reports')).status, 403);
    const reports = (await admin.get('/api/admin/reports')).body.items;
    assert.strictEqual(reports.length, 2);

    const reviewReport = reports.find((r) => r.targetType === 'review');
    await admin.post(`/api/admin/reports/${reviewReport.id}/resolve`, { action: 'hide' });
    const pub = await client(base).get('/api/reviews/21');
    assert.strictEqual(pub.body.count, 1);
    assert.strictEqual(pub.body.items.length, 1);

    const msgReport = reports.find((r) => r.targetType === 'message');
    await admin.post(`/api/admin/reports/${msgReport.id}/resolve`, { action: 'delete' });
    assert.strictEqual((await admin.get('/api/admin/reports')).body.items.length, 0);
    assert.strictEqual((await admin.get('/api/admin/stats')).body.openReports, 0);
  });

  await test('бан і ролі', async () => {
    const users = (await admin.get('/api/admin/users?q=bo')).body.items;
    const bobUser = users.find((u) => u.username === 'bob');
    await admin.post(`/api/admin/users/${bobUser.id}/ban`, { reason: 'спам' });
    const r = await bob.post('/api/reviews/5', { rating: 5, text: 'знову спам' });
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.body.error, 'banned');

    const aliceUser = (await admin.get('/api/admin/users?q=alice')).body.items[0];
    await admin.post(`/api/admin/users/${aliceUser.id}/role`, { role: 'moderator' });
    assert.strictEqual((await alice.get('/api/admin/stats')).status, 200);
    // Модератор не може призначати ролі
    assert.strictEqual((await alice.post(`/api/admin/users/${bobUser.id}/role`, { role: 'admin' })).status, 403);
  });

  await test('безпека: чужий Origin, поганий JSON, 404', async () => {
    const res = await fetch(base + '/api/auth/logout', { method: 'POST', headers: { Origin: 'https://evil.example' } });
    assert.strictEqual(res.status, 403);
    const bad = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
    assert.strictEqual(bad.status, 400);
    assert.strictEqual((await fetch(base + '/api/nope')).status, 404);
  });

  for (const [mark, name, err] of results) console.log(mark, name, err ? '→ ' + err : '');
  const failed = results.filter((r) => r[0] === '✘').length;
  console.log(failed ? `\n${failed} тест(ів) не пройшли` : `\nУсі ${results.length} тестів пройшли`);
  server.close();
  process.exit(failed ? 1 : 0);
})();
