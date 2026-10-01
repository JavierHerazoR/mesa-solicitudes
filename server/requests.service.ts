import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SQLInputValue } from 'node:sqlite';
import { DatabaseService } from './database.service';
import { ChangeStatusDto, CreateRequestDto, RequestFiltersDto } from './requests.dto';
import {
  HistoryEvent,
  PRIORITY_LABELS,
  RequestDetail,
  RequestStatus,
  ServiceRequest,
  STATUS_LABELS,
} from './requests.types';

type RequestRow = Omit<ServiceRequest, 'code'>;
const withCode = (row: RequestRow): ServiceRequest => ({
  ...row,
  code: `MES-${String(row.id).padStart(4, '0')}`,
});

// Literal LIKE search: user-supplied %, _ and backslashes are not SQL wildcards.
const escapeLike = (text: string) => text.replace(/[\\%_]/g, '\\$&');

// Spreadsheet applications may execute text beginning with these characters.
export function csvCell(input: unknown): string {
  const text = String(input ?? '');
  const safe = /^[\s\uFEFF]*[=+@-]/u.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

@Injectable()
export class RequestsService {
  constructor(private readonly database: DatabaseService) {}

  private filters(filters: RequestFiltersDto): { where: string; params: SQLInputValue[] } {
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
      throw new BadRequestException('La fecha inicial no puede ser posterior a la fecha final.');
    }
    const clauses: string[] = [];
    const params: SQLInputValue[] = [];
    for (const field of ['status', 'priority', 'category'] as const) {
      if (filters[field]) {
        clauses.push(`${field} = ?`);
        params.push(filters[field]);
      }
    }
    if (filters.search) {
      clauses.push(
        "(title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' OR requester LIKE ? ESCAPE '\\' OR printf('MES-%04d', id) LIKE ? ESCAPE '\\')",
      );
      const search = `%${escapeLike(filters.search)}%`;
      params.push(search, search, search, search);
    }
    // A calendar day in Colombia starts at 05:00 UTC. The upper bound is exclusive.
    if (filters.dateFrom) {
      clauses.push('createdAt >= ?');
      params.push(`${filters.dateFrom}T05:00:00.000Z`);
    }
    if (filters.dateTo) {
      const nextDate = new Date(Date.parse(`${filters.dateTo}T00:00:00.000Z`) + 86_400_000)
        .toISOString()
        .slice(0, 10);
      clauses.push('createdAt < ?');
      params.push(`${nextDate}T05:00:00.000Z`);
    }
    return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
  }

  list(filters: RequestFiltersDto) {
    const { where, params } = this.filters(filters);
    const { total } = this.database.connection
      .prepare(`SELECT COUNT(*) AS total FROM requests ${where}`)
      .get(...params) as { total: number };
    const rows = this.database.connection
      .prepare(`SELECT * FROM requests ${where} ORDER BY createdAt DESC, id DESC LIMIT ? OFFSET ?`)
      .all(
        ...params,
        filters.pageSize,
        (filters.page - 1) * filters.pageSize,
      ) as unknown as RequestRow[];
    return {
      items: rows.map(withCode),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(total / filters.pageSize),
    };
  }

  stats() {
    return this.database.connection
      .prepare(
        `
      SELECT COUNT(*) AS total,
        COALESCE(SUM(status = 'pending'), 0) AS pending,
        COALESCE(SUM(status = 'in_progress'), 0) AS in_progress,
        COALESCE(SUM(status = 'resolved'), 0) AS resolved,
        COALESCE(SUM(priority = 'high'), 0) AS highPriority
      FROM requests
    `,
      )
      .get();
  }

  detail(id: number): RequestDetail {
    const row = this.database.connection
      .prepare('SELECT * FROM requests WHERE id = ?')
      .get(id) as unknown as RequestRow | undefined;
    if (!row) throw new NotFoundException('No encontramos esa solicitud.');
    const history = this.database.connection
      .prepare(
        'SELECT id, fromStatus, toStatus, note, createdAt FROM request_history WHERE requestId = ? ORDER BY id ASC',
      )
      .all(id) as unknown as HistoryEvent[];
    return { ...withCode(row), history };
  }

  create(input: CreateRequestDto): RequestDetail {
    return this.database.transaction(() => {
      const now = new Date().toISOString();
      const result = this.database.connection
        .prepare(
          'INSERT INTO requests (title, description, requester, category, priority, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          input.title,
          input.description,
          input.requester,
          input.category,
          input.priority,
          now,
          now,
        );
      const id = Number(result.lastInsertRowid);
      this.database.connection
        .prepare(
          'INSERT INTO request_history (requestId, fromStatus, toStatus, note, createdAt) VALUES (?, NULL, ?, ?, ?)',
        )
        .run(id, 'pending', 'Solicitud creada.', now);
      return this.detail(id);
    });
  }

  changeStatus(id: number, input: ChangeStatusDto): RequestDetail {
    return this.database.transaction(() => {
      const current = this.detail(id);
      const allowed: Record<RequestStatus, RequestStatus[]> = {
        pending: ['in_progress'],
        in_progress: ['resolved'],
        resolved: ['in_progress'],
      };
      if (!allowed[current.status].includes(input.status)) {
        throw new ConflictException(
          `No se puede pasar de «${STATUS_LABELS[current.status]}» a «${STATUS_LABELS[input.status]}».`,
        );
      }
      const now = new Date().toISOString();
      this.database.connection
        .prepare('UPDATE requests SET status = ?, updatedAt = ? WHERE id = ?')
        .run(input.status, now, id);
      this.database.connection
        .prepare(
          'INSERT INTO request_history (requestId, fromStatus, toStatus, note, createdAt) VALUES (?, ?, ?, ?, ?)',
        )
        .run(id, current.status, input.status, input.note ?? '', now);
      return this.detail(id);
    });
  }

  exportCsv(filters: RequestFiltersDto): string {
    const { where, params } = this.filters(filters);
    const rows = this.database.connection
      .prepare(`SELECT * FROM requests ${where} ORDER BY createdAt DESC, id DESC`)
      .all(...params) as unknown as RequestRow[];
    const header = [
      'Código',
      'Título',
      'Descripción',
      'Solicitante',
      'Categoría',
      'Prioridad',
      'Estado',
      'Creada',
      'Actualizada',
    ];
    const lines = [header.map(csvCell).join(',')];
    for (const row of rows) {
      const request = withCode(row);
      lines.push(
        [
          request.code,
          request.title,
          request.description,
          request.requester,
          request.category,
          PRIORITY_LABELS[request.priority],
          STATUS_LABELS[request.status],
          request.createdAt,
          request.updatedAt,
        ]
          .map(csvCell)
          .join(','),
      );
    }
    return '\uFEFF' + lines.join('\r\n') + '\r\n';
  }
}
