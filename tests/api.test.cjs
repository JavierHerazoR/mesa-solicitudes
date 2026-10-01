const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const request = require('supertest');
const { createApp } = require('../dist/server/app.js');
const { DatabaseService } = require('../dist/server/database.service.js');
const { csvCell } = require('../dist/server/requests.service.js');

let app;
let http;
let createdId;
let initialTotal;
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'mesa-api-'));
const previousPath = process.env.DATABASE_PATH;

const validRequest = {
  title: '  Revisar acceso de demostración  ',
  description: 'Necesito revisar el acceso al tablero de solicitudes de demostración.',
  requester: '  Persona Demo  ',
  category: 'Accesos',
  priority: 'high',
};

before(async () => {
  process.env.DATABASE_PATH = join(temporaryDirectory, 'test.sqlite');
  app = await createApp();
  await app.listen(0, '127.0.0.1');
  http = request(app.getHttpServer());
});

after(async () => {
  await app?.close();
  if (previousPath === undefined) delete process.env.DATABASE_PATH;
  else process.env.DATABASE_PATH = previousPath;
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('health and deterministic pagination of fictional seed data', async () => {
  const health = await http.get('/api/health').expect(200);
  assert.equal(health.body.status, 'ok');
  const result = await http.get('/api/requests').expect(200);
  initialTotal = result.body.total;
  assert.equal(initialTotal, 16);
  assert.equal(result.body.page, 1);
  assert.equal(result.body.pageSize, 8);
  assert.equal(result.body.items.length, 8);
  assert.equal(result.body.totalPages, 2);
  const second = await http.get('/api/requests?page=2').expect(200);
  assert.equal(second.body.items.length, 8);
  assert.equal(
    new Set([...result.body.items, ...second.body.items].map((item) => item.id)).size,
    16,
  );
  const beyond = await http.get('/api/requests?page=3').expect(200);
  assert.equal(beyond.body.items.length, 0);
  assert.equal(beyond.body.total, 16);
});

test('combines filters and literal search; stats stay global', async () => {
  const filtered = await http
    .get('/api/requests')
    .query({ status: 'pending', priority: 'high', category: 'Accesos', search: 'Lucía' })
    .expect(200);
  assert.equal(filtered.body.total, 1);
  assert.equal(filtered.body.items[0].code, 'MES-0001');
  const code = await http.get('/api/requests').query({ search: 'MES-0001' }).expect(200);
  assert.equal(code.body.total, 1);
  const wildcard = await http.get('/api/requests').query({ search: '%' }).expect(200);
  assert.equal(wildcard.body.total, 0);
  const stats = await http.get('/api/requests/stats').expect(200);
  assert.equal(stats.body.total, 16);
  assert.equal(stats.body.pending + stats.body.in_progress + stats.body.resolved, 16);
  assert.equal(stats.body.highPriority, 4);
});

test('rejects invalid filters, unknown fields, invalid bodies and identifiers', async () => {
  for (const query of [
    'status=unknown',
    'category=Otra',
    'priority=urgent',
    'page=0',
    'page=1.5',
    'pageSize=51',
    'pageSize=',
    'page=1e2',
    'sort=id',
    'page=1&page=2',
  ]) {
    await http.get(`/api/requests?${query}`).expect(400);
  }
  const empty = await http
    .post('/api/requests')
    .send({ ...validRequest, title: '   ' })
    .expect(400);
  assert.match(empty.body.message.join(' '), /título/);
  await http
    .post('/api/requests')
    .send({ ...validRequest, status: 'resolved' })
    .expect(400);
  await http
    .post('/api/requests')
    .send({ ...validRequest, description: 'short' })
    .expect(400);
  await http
    .post('/api/requests')
    .send({ ...validRequest, requester: 'x'.repeat(71) })
    .expect(400);
  await http.get('/api/requests/does-not-exist').expect(400);
  await http.get('/api/requests/999999').expect(404);
});

test('creates a trimmed pending request with an initial history event', async () => {
  const response = await http.post('/api/requests').send(validRequest).expect(201);
  createdId = response.body.id;
  assert.equal(response.body.title, validRequest.title.trim());
  assert.equal(response.body.requester, validRequest.requester.trim());
  assert.equal(response.body.status, 'pending');
  assert.match(response.body.code, /^MES-\d{4}$/);
  assert.equal(response.body.history.length, 1);
  assert.equal(response.body.history[0].fromStatus, null);
  assert.equal(response.body.history[0].toStatus, 'pending');
  const stats = await http.get('/api/requests/stats').expect(200);
  assert.equal(stats.body.total, initialTotal + 1);
});

test('enforces transitions atomically and preserves the ordered history', async () => {
  await http.patch(`/api/requests/${createdId}/status`).send({ status: 'resolved' }).expect(409);
  await http.patch(`/api/requests/${createdId}/status`).send({ status: 'pending' }).expect(409);
  await http
    .patch(`/api/requests/${createdId}/status`)
    .send({ status: 'in_progress', note: 'x'.repeat(501) })
    .expect(400);
  await http
    .patch(`/api/requests/${createdId}/status`)
    .send({ status: 'in_progress', unexpected: true })
    .expect(400);
  const untouched = await http.get(`/api/requests/${createdId}`).expect(200);
  assert.equal(untouched.body.history.length, 1);
  assert.equal(untouched.body.status, 'pending');
  const started = await http
    .patch(`/api/requests/${createdId}/status`)
    .send({ status: 'in_progress', note: '  Revisando permisos.  ' })
    .expect(200);
  assert.equal(started.body.history[1].note, 'Revisando permisos.');
  await http
    .patch(`/api/requests/${createdId}/status`)
    .send({ status: 'resolved', note: 'Acceso validado.' })
    .expect(200);
  await http.patch(`/api/requests/${createdId}/status`).send({ status: 'pending' }).expect(409);
  const reopened = await http
    .patch(`/api/requests/${createdId}/status`)
    .send({ status: 'in_progress', note: 'Se necesita una nueva revisión.' })
    .expect(200);
  assert.equal(reopened.body.history.length, 4);
  assert.deepEqual(
    reopened.body.history.map((event) => event.toStatus),
    ['pending', 'in_progress', 'resolved', 'in_progress'],
  );
  assert.deepEqual(
    reopened.body.history.map((event) => event.fromStatus),
    [null, 'pending', 'in_progress', 'resolved'],
  );
  assert.equal(reopened.body.status, 'in_progress');
});

test('export uses the same filters without pagination and escapes CSV formula content', async () => {
  const injectedTitle = '=HYPERLINK("https://example.com")';
  const dangerous = await http
    .post('/api/requests')
    .send({
      ...validRequest,
      title: injectedTitle,
      description: 'Descripción con "comillas", una coma\r\ny una nueva línea.',
      requester: '+Persona demo',
    })
    .expect(201);
  const csv = await http
    .get('/api/requests/export')
    .query({ search: dangerous.body.code })
    .expect(200);
  assert.match(csv.headers['content-type'], /text\/csv; charset=utf-8/);
  assert.match(csv.headers['content-disposition'], /mesa-solicitudes\.csv/);
  assert.equal(csv.text.charCodeAt(0), 0xfeff);
  assert.ok(csv.text.includes(`"'=HYPERLINK(""https://example.com"")"`));
  assert.ok(csv.text.includes('"\'+Persona demo"'));
  assert.ok(csv.text.includes('"Descripción con ""comillas"", una coma\r\ny una nueva línea."'));
  assert.ok(!csv.text.includes('MES-0001'));
  const all = await http.get('/api/requests/export?pageSize=1').expect(200);
  assert.ok(all.text.includes('MES-0001'));
  assert.ok(all.text.includes('MES-0016'));
  const filter = { category: 'Operaciones', status: 'resolved', priority: 'medium' };
  const list = await http.get('/api/requests').query(filter).expect(200);
  const filteredCsv = await http.get('/api/requests/export').query(filter).expect(200);
  const codes = [...filteredCsv.text.matchAll(/"(MES-\d+)"/g)].map((match) => match[1]);
  assert.deepEqual(
    codes,
    list.body.items.map((item) => item.code),
  );
  for (const text of ['=SUM(1,2)', '+cmd', '-2+3', '@SUM(1)', ' \t=1+1', '\n@x']) {
    assert.equal(csvCell(text), `"'${text}"`);
  }
  assert.equal(csvCell('texto "normal"'), '"texto ""normal"""');
});

test('SQL-like user input is stored and searched as text without changing other records', async () => {
  const before = await http.get('/api/requests/stats').expect(200);
  const payload = "' OR 1=1; DROP TABLE requests; --";
  const search = await http.get('/api/requests').query({ search: payload }).expect(200);
  assert.equal(search.body.total, 0);
  const created = await http
    .post('/api/requests')
    .send({ ...validRequest, title: payload })
    .expect(201);
  assert.equal(created.body.title, payload);
  const match = await http.get('/api/requests').query({ search: payload }).expect(200);
  assert.equal(match.body.total, 1);
  assert.equal(match.body.items[0].id, created.body.id);
  const after = await http.get('/api/requests/stats').expect(200);
  assert.equal(after.body.total, before.body.total + 1);
});

test('requests and history survive restart without duplicating the demonstration seed', async () => {
  const before = await http.get('/api/requests/stats').expect(200);
  await app.close();
  app = await createApp();
  await app.listen(0, '127.0.0.1');
  http = request(app.getHttpServer());
  const after = await http.get('/api/requests/stats').expect(200);
  assert.deepEqual(after.body, before.body);
  const detail = await http.get(`/api/requests/${createdId}`).expect(200);
  assert.equal(detail.body.status, 'in_progress');
  assert.equal(detail.body.history.length, 4);
});

test('creation date range uses Colombia calendar days in both list and CSV', async () => {
  const dates = [
    '2026-09-30T04:59:59.000Z', // September 29 in Colombia
    '2026-09-30T05:00:00.000Z', // September 30 begins
    '2026-10-01T04:59:59.000Z', // September 30 ends
    '2026-10-01T05:00:00.000Z', // October 1 begins
  ];
  const database = app.get(DatabaseService).connection;
  const codes = [];
  for (const [index, createdAt] of dates.entries()) {
    const response = await http
      .post('/api/requests')
      .send({ ...validRequest, title: `Marcador de fecha ${index + 1}` })
      .expect(201);
    database
      .prepare('UPDATE requests SET createdAt = ? WHERE id = ?')
      .run(createdAt, response.body.id);
    codes.push(response.body.code);
  }
  const search = 'Marcador de fecha';
  const range = { search, dateFrom: '2026-09-30', dateTo: '2026-09-30' };
  const list = await http.get('/api/requests').query(range).expect(200);
  assert.equal(list.body.total, 2);
  assert.deepEqual(
    list.body.items.map((item) => item.code),
    [codes[2], codes[1]],
  );
  const csv = await http.get('/api/requests/export').query(range).expect(200);
  assert.deepEqual(
    [...csv.text.matchAll(/"(MES-\d+)"/g)].map((match) => match[1]),
    [codes[2], codes[1]],
  );
  const from = await http
    .get('/api/requests')
    .query({ search, dateFrom: '2026-09-30' })
    .expect(200);
  assert.equal(from.body.total, 3);
  const to = await http.get('/api/requests').query({ search, dateTo: '2026-09-30' }).expect(200);
  assert.equal(to.body.total, 3);
  for (const query of [
    { dateFrom: '2026-02-31' },
    { dateTo: '2026-13-01' },
    { dateFrom: '2026-09-30T00:00:00Z' },
    { dateFrom: '2026-10-01', dateTo: '2026-09-30' },
  ]) {
    await http.get('/api/requests').query(query).expect(400);
    await http.get('/api/requests/export').query(query).expect(400);
  }
});
