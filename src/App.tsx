import { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileBarChart2,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { filterParams } from './api';
import { Dialog } from './Dialog';
import { NewRequestDialog } from './NewRequestDialog';
import { RequestDetailDialog } from './RequestDetailDialog';
import { useRequests } from './useRequests';
import {
  categories,
  priorityLabels,
  statusLabels,
  type Category,
  type Filters,
  type Priority,
  type Stats,
  type Status,
} from './types';

type View = 'overview' | 'requests' | 'reports';
const emptyFilters: Filters = { search: '', status: '', priority: '', category: '' };
const shortDate = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' });

export function App() {
  const [view, setView] = useState<View>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [about, setAbout] = useState(false);
  const [toast, setToast] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const { data, stats, loading, error } = useRequests(filters, page, revision);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((value) => ({ ...value, search }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (data && page > Math.max(1, data.totalPages)) setPage(Math.max(1, data.totalPages));
  }, [data, page]);
  function changeFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }
  function clear() {
    setSearch('');
    setFilters(emptyFilters);
    setPage(1);
  }
  function navigate(next: View) {
    setView(next);
    setMenuOpen(false);
  }
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    setExportError('');
    try {
      const response = await fetch(`/api/requests/export?${filterParams(filters)}`);
      if (!response.ok) throw new Error('No pudimos generar el reporte. Intenta de nuevo.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mesa-solicitudes.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToast('Reporte descargado con los filtros seleccionados.');
    } catch (reason) {
      setExportError(reason instanceof Error ? reason.message : 'No se pudo descargar el reporte.');
    } finally {
      setExporting(false);
    }
  }
  const filtered = Object.values(filters).some(Boolean);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      {menuOpen && (
        <button
          className="nav-overlay"
          aria-label="Cerrar navegación"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`} aria-label="Navegación principal">
        <a
          href="#main"
          className="brand"
          onClick={() => navigate('overview')}
          aria-label="Mesa, inicio"
        >
          <span className="brand-symbol">
            <i />
            <i />
            <i />
          </span>
          mesa<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">
          <span className="workspace-icon">D</span>
          <div>
            Espacio de trabajo<small>Demostración</small>
          </div>
          <span className="live-dot" />
        </div>
        <p className="nav-label">TU ESPACIO</p>
        <nav>
          <button
            className={view === 'overview' ? 'active' : ''}
            onClick={() => navigate('overview')}
          >
            <LayoutDashboard size={18} />
            Vista general
          </button>
          <button
            className={view === 'requests' ? 'active' : ''}
            onClick={() => navigate('requests')}
          >
            <ClipboardList size={18} />
            Solicitudes<span className="nav-count">{stats?.total ?? '—'}</span>
          </button>
          <button
            className={view === 'reports' ? 'active' : ''}
            onClick={() => navigate('reports')}
          >
            <FileBarChart2 size={18} />
            Reportes
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-symbol">↗</span>
            <strong>
              Menos pendientes.
              <br />
              Más claridad.
            </strong>
            <p>
              Un lugar para cada solicitud.
              <br />
              Un siguiente paso para tu equipo.
            </p>
          </div>
          <button className="about-button" onClick={() => setAbout(true)}>
            <CircleHelp size={17} />
            Sobre este proyecto
            <ArrowUpRight size={15} />
          </button>
          <div className="profile">
            <span className="avatar">JH</span>
            <div>
              Javier Herazo<small>Proyecto de portafolio</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir navegación"
            >
              <Menu size={20} />
            </button>
            <span>Espacio de trabajo</span>
            <span>/</span>
            <strong>
              {view === 'overview'
                ? 'Vista general'
                : view === 'requests'
                  ? 'Solicitudes'
                  : 'Reportes'}
            </strong>
          </div>
          <span className="demo-badge">
            <i />
            Datos de demostración
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          <section className="page-heading">
            <div>
              <p className="eyebrow">TODO EN SU LUGAR</p>
              <h1>
                {view === 'reports'
                  ? 'Del seguimiento a los datos.'
                  : view === 'requests'
                    ? 'Cada solicitud, a la vista.'
                    : 'Tus solicitudes, en orden.'}
              </h1>
              <p>
                {view === 'reports'
                  ? 'Consulta el estado general y lleva tus datos a una hoja de cálculo.'
                  : 'Organiza, da seguimiento y mantén el trabajo en movimiento.'}
              </p>
            </div>
            <button className="button primary" onClick={() => setCreating(true)}>
              <Plus size={18} />
              Nueva solicitud
            </button>
          </section>
          {view !== 'requests' && (
            <Metrics
              stats={stats}
              onFilter={(status) => {
                changeFilter('status', status);
                setView('requests');
              }}
            />
          )}
          {view === 'reports' && (
            <section className="report-card">
              <div>
                <p className="eyebrow">PANORAMA GENERAL</p>
                <h2>¿En qué punto está el trabajo?</h2>
                <p>Distribución de todas las solicitudes del espacio.</p>
              </div>
              <div className="bars">
                {(['pending', 'in_progress', 'resolved'] as Status[]).map((status) => (
                  <div className="bar-row" key={status}>
                    <span>{statusLabels[status]}</span>
                    <div className="bar-track">
                      <div
                        className={status}
                        style={{
                          width: `${stats?.total ? (stats[status] / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <strong>{stats?.[status] ?? '—'}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}
          <section className="requests-panel" aria-labelledby="requests-title">
            <div className="panel-title">
              <div>
                <h2 id="requests-title">
                  {view === 'reports' ? 'Prepara tu reporte' : 'Bandeja de solicitudes'}
                  <span className="count-pill">{data?.total ?? '—'}</span>
                </h2>
                <p>
                  {view === 'reports'
                    ? 'El CSV incluye todos los resultados que coinciden con los filtros.'
                    : 'Lo que necesita atención y lo que ya está resuelto.'}
                </p>
              </div>
              <button
                className="button secondary export-button"
                disabled={
                  exporting || loading || !!error || search.trim() !== filters.search.trim()
                }
                onClick={exportCsv}
              >
                {exporting ? (
                  <LoaderCircle size={16} className="spin" />
                ) : (
                  <ArrowDownToLine size={16} />
                )}
                {exporting ? 'Exportando…' : 'Exportar CSV'}
              </button>
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
            <div className="filters">
              <label className="search-input">
                <Search size={17} />
                <span className="sr-only">Buscar solicitudes</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  maxLength={100}
                  placeholder="Buscar por asunto o solicitante…"
                />
                {search && (
                  <button
                    className="clear-search"
                    aria-label="Borrar búsqueda"
                    onClick={() => setSearch('')}
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
              <div className="select-filters">
                <SlidersHorizontal size={16} aria-hidden="true" />
                <label>
                  <span className="sr-only">Filtrar por categoría</span>
                  <select
                    aria-label="Filtrar por categoría"
                    value={filters.category}
                    onChange={(e) => changeFilter('category', e.target.value as '' | Category)}
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filtrar por prioridad</span>
                  <select
                    aria-label="Filtrar por prioridad"
                    value={filters.priority}
                    onChange={(e) => changeFilter('priority', e.target.value as '' | Priority)}
                  >
                    <option value="">Toda prioridad</option>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                {filtered && (
                  <button className="clear-filters" onClick={clear}>
                    Limpiar
                  </button>
                )}
              </div>
            </div>
            {exportError && (
              <p className="error export-error" role="alert">
                {exportError}
              </p>
            )}
            {error ? (
              <div className="empty-state" role="alert">
                <CircleHelp size={32} />
                <h3>No pudimos cargar las solicitudes</h3>
                <p>{error}</p>
                <button className="button secondary" onClick={() => setRevision((v) => v + 1)}>
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
                <button
                  className="button secondary"
                  onClick={filtered ? clear : () => setCreating(true)}
                >
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
                          <button className="request-title" onClick={() => setSelected(item.id)}>
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
                            onClick={() => setSelected(item.id)}
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
          <footer className="page-footer">
            <span>
              <span className="footer-dot" />
              Un paso a la vez. Todo bajo seguimiento.
            </span>
            <button onClick={() => setAbout(true)}>
              Hecho por Javier Herazo <ArrowUpRight size={13} />
            </button>
          </footer>
        </main>
      </div>
      {creating && (
        <NewRequestDialog
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            setSelected(id);
            setRevision((v) => v + 1);
            setToast('Solicitud creada. Ya puedes darle seguimiento.');
          }}
        />
      )}
      {selected !== null && (
        <RequestDetailDialog
          id={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            setRevision((v) => v + 1);
            setToast('Estado actualizado e historial guardado.');
          }}
        />
      )}
      {about && (
        <Dialog title="Un proyecto para mostrar cómo trabajo" onClose={() => setAbout(false)}>
          <div className="about-content">
            <p>
              Mesa es una aplicación de portafolio de Javier Herazo, desarrollador full stack
              junior. Combina React, NestJS y SQLite para seguir solicitudes de principio a fin.
            </p>
            <p>
              Este espacio contiene datos ficticios. Puedes crear solicitudes, cambiar su estado,
              consultar el historial y descargar reportes.
            </p>
            <a
              className="button secondary"
              href="https://github.com/JavierHerazoR"
              target="_blank"
              rel="noreferrer"
            >
              Perfil de GitHub <ArrowUpRight size={16} />
            </a>
            <small>
              Proyecto construido con asistencia de IA. Las decisiones, el alcance y las pruebas
              están documentados en el repositorio local.
            </small>
          </div>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{toast}</span>
          <button aria-label="Cerrar aviso" onClick={() => setToast('')}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function Metrics({
  stats,
  onFilter,
}: {
  stats: Stats | null;
  onFilter: (status: '' | Status) => void;
}) {
  const metrics = [
    {
      title: 'Solicitudes totales',
      value: stats?.total,
      subtitle: 'Una vista de todo el trabajo',
      icon: ClipboardList,
      filter: '' as const,
      tone: 'total',
    },
    {
      title: 'Por atender',
      value: stats?.pending,
      subtitle: 'Esperando el siguiente paso',
      icon: Clock3,
      filter: 'pending' as const,
      tone: 'pending',
    },
    {
      title: 'En curso',
      value: stats?.in_progress,
      subtitle: 'El trabajo está en movimiento',
      icon: ArrowRight,
      filter: 'in_progress' as const,
      tone: 'in-progress',
    },
    {
      title: 'Resueltas',
      value: stats?.resolved,
      subtitle: 'Un pendiente menos',
      icon: CheckCheck,
      filter: 'resolved' as const,
      tone: 'resolved',
    },
  ];
  return (
    <section className="metrics" aria-label="Resumen global de solicitudes">
      {metrics.map(({ title, value, subtitle, icon: Icon, filter, tone }) => (
        <button key={title} className={`metric ${tone}`} onClick={() => onFilter(filter)}>
          <div className="metric-heading">
            <span>{title}</span>
            <span className="metric-icon">
              <Icon size={17} />
            </span>
          </div>
          <strong>{value ?? '—'}</strong>
          <div className="metric-bottom">
            <span>{subtitle}</span>
            <ArrowUpRight size={15} />
          </div>
        </button>
      ))}
    </section>
  );
}
