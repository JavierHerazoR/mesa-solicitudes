import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  LoaderCircle,
  Plus,
  Search,
} from 'lucide-react';
import { priorityLabels, statusLabels, type Filters, type Stats } from '../types';
import { useRequests } from '../useRequests';
import { useRequestFilters } from '../useRequestFilters';
import { RequestFilters } from '../components/RequestFilters';
const shortDate = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  timeZone: 'America/Bogota',
});
export function RequestsView({
  revision,
  stats,
  initialFilters,
  onCreate,
  onSelect,
}: {
  revision: number;
  stats: Stats | null;
  initialFilters: Partial<Filters>;
  onCreate: () => void;
  onSelect: (id: number) => void;
}) {
  const controls = useRequestFilters(initialFilters);
  const { filters, page, setPage, changeFilter, clear, filtered } = controls;
  const [attempt, retry] = useState(0);
  const { data, loading, error } = useRequests(filters, page, revision + attempt);
  useEffect(() => {
    if (data && page > Math.max(1, data.totalPages)) setPage(Math.max(1, data.totalPages));
  }, [data, page, setPage]);
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">SOLICITUDES</p>
          <h1>Cada solicitud, a la vista.</h1>
          <p>Gestiona solicitudes, actualiza estados y consulta su historial.</p>
        </div>
        <button className="button primary" onClick={onCreate}>
          <Plus size={18} />
          Nueva solicitud
        </button>
      </section>
      <section className="requests-panel" aria-labelledby="requests-title">
        <div className="panel-title">
          <div>
            <h2 id="requests-title">
              Bandeja de solicitudes
              <span className="count-pill">{data?.total ?? '—'}</span>
            </h2>
            <p>Busca, filtra y abre una solicitud para gestionar su estado.</p>
          </div>
        </div>
        <div className="status-tabs" role="group" aria-label="Filtrar por estado">
          {(['', 'pending', 'in_progress', 'resolved'] as const).map((status) => (
            <button
              key={status}
              aria-pressed={filters.status === status}
              className={filters.status === status ? 'selected' : ''}
              onClick={() => changeFilter('status', status)}
            >
              {status ? statusLabels[status] : 'Todas'}
              <span>{status ? (stats?.[status] ?? '—') : (stats?.total ?? '—')}</span>
            </button>
          ))}
        </div>
        <RequestFilters {...controls} />
        {error ? (
          <div className="empty-state" role="alert">
            <CircleHelp size={32} />
            <h3>No pudimos cargar las solicitudes</h3>
            <p>{error}</p>
            <button className="button secondary" onClick={() => retry((v) => v + 1)}>
              Volver a intentar
            </button>
          </div>
        ) : loading ? (
          <div className="loading" role="status">
            <LoaderCircle className="spin" size={24} />
            <span>Cargando solicitudes…</span>
          </div>
        ) : !data?.items.length ? (
          <div className="empty-state">
            <Search size={32} />
            <h3>
              {filtered ? 'No encontramos coincidencias' : 'Tu bandeja está lista para empezar'}
            </h3>
            <p>
              {filtered
                ? 'Prueba otro término o ajusta los filtros.'
                : 'Crea una solicitud para comenzar el seguimiento.'}
            </p>
            <button className="button secondary" onClick={filtered ? clear : onCreate}>
              {filtered ? 'Limpiar filtros' : 'Crear primera solicitud'}
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">SOLICITUD</th>
                  <th scope="col">CATEGORÍA</th>
                  <th scope="col">PRIORIDAD</th>
                  <th scope="col">ESTADO</th>
                  <th scope="col">REGISTRO</th>
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button className="request-title" onClick={() => onSelect(item.id)}>
                        {item.title}
                      </button>
                      <div className="request-subtitle">
                        <span>{item.code}</span>
                        <i />
                        {item.requester}
                      </div>
                    </td>
                    <td>
                      <span className="category">{item.category}</span>
                    </td>
                    <td>
                      <span className={`priority ${item.priority}`}>
                        <i />
                        {priorityLabels[item.priority]}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${item.status}`}>
                        <i />
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="date-cell">{shortDate.format(new Date(item.createdAt))}</td>
                    <td>
                      <button
                        className="row-action"
                        onClick={() => onSelect(item.id)}
                        aria-label={`Ver ${item.code}`}
                      >
                        <ArrowUpRight size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <footer className="table-footer">
          <span>
            {error
              ? 'Información no disponible'
              : loading
                ? 'Actualizando…'
                : `Mostrando ${data?.total ? (page - 1) * 8 + 1 : 0}–${Math.min(page * 8, data?.total ?? 0)} de ${data?.total ?? 0} solicitudes`}
          </span>
          <div className="pagination">
            <button
              aria-label="Página anterior"
              disabled={page <= 1 || loading || !!error}
              onClick={() => setPage((v) => v - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Página {page} de {Math.max(1, data?.totalPages ?? 1)}
            </span>
            <button
              aria-label="Página siguiente"
              disabled={page >= (data?.totalPages ?? 1) || loading || !!error}
              onClick={() => setPage((v) => v + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}
