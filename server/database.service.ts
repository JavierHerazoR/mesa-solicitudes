import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DEMO_REQUESTS } from './seed';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly connection: DatabaseSync;

  constructor() {
    const configuredPath = process.env.DATABASE_PATH || 'data/mesa.sqlite';
    const filePath = configuredPath === ':memory:' ? configuredPath : resolve(configuredPath);
    const fresh = filePath === ':memory:' || !existsSync(filePath);
    if (filePath !== ':memory:') mkdirSync(dirname(filePath), { recursive: true });
    this.connection = new DatabaseSync(filePath);
    this.connection.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(title) BETWEEN 3 AND 100),
        description TEXT NOT NULL CHECK(length(description) BETWEEN 10 AND 1500),
        requester TEXT NOT NULL CHECK(length(requester) BETWEEN 3 AND 70),
        category TEXT NOT NULL CHECK(category IN ('Soporte','Accesos','Facturación','Operaciones')),
        priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','resolved')),
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS request_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
        fromStatus TEXT CHECK(fromStatus IS NULL OR fromStatus IN ('pending','in_progress','resolved')),
        toStatus TEXT NOT NULL CHECK(toStatus IN ('pending','in_progress','resolved')),
        note TEXT NOT NULL DEFAULT '' CHECK(length(note) <= 500),
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS requests_created_idx ON requests(createdAt DESC, id DESC);
      CREATE INDEX IF NOT EXISTS request_history_request_idx ON request_history(requestId, id);
    `);
    if (fresh) this.seed();
  }

  transaction<T>(action: () => T): T {
    this.connection.exec('BEGIN IMMEDIATE');
    try {
      const result = action();
      this.connection.exec('COMMIT');
      return result;
    } catch (error) {
      this.connection.exec('ROLLBACK');
      throw error;
    }
  }

  private seed(): void {
    const insert = this.connection.prepare(
      'INSERT INTO requests (title, description, requester, category, priority, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    const history = this.connection.prepare(
      'INSERT INTO request_history (requestId, fromStatus, toStatus, note, createdAt) VALUES (?, ?, ?, ?, ?)',
    );
    const baseTime = Date.now() - 2 * 60 * 60 * 1000;
    this.transaction(() => {
      DEMO_REQUESTS.forEach((request, index) => {
        const created = baseTime - index * 5 * 60 * 60 * 1000;
        const createdAt = new Date(created).toISOString();
        const startedAt = new Date(created + 20 * 60 * 1000).toISOString();
        const resolvedAt = new Date(created + 65 * 60 * 1000).toISOString();
        const updatedAt =
          request.status === 'resolved'
            ? resolvedAt
            : request.status === 'in_progress'
              ? startedAt
              : createdAt;
        const id = Number(
          insert.run(
            request.title,
            request.description,
            request.requester,
            request.category,
            request.priority,
            request.status,
            createdAt,
            updatedAt,
          ).lastInsertRowid,
        );
        history.run(id, null, 'pending', 'Solicitud de demostración creada.', createdAt);
        if (request.status !== 'pending')
          history.run(
            id,
            'pending',
            'in_progress',
            'Se inició la revisión de la solicitud.',
            startedAt,
          );
        if (request.status === 'resolved')
          history.run(
            id,
            'in_progress',
            'resolved',
            'Se verificó la solución en el entorno de demostración.',
            resolvedAt,
          );
      });
    });
  }

  onModuleDestroy(): void {
    this.connection.close();
  }
}
