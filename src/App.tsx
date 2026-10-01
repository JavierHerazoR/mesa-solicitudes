import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CircleHelp,
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { Dialog } from './Dialog';
import { NewRequestDialog } from './NewRequestDialog';
import { RequestDetailDialog } from './RequestDetailDialog';
import { useStats } from './useStats';
import { OverviewView } from './views/OverviewView';
import { RequestsView } from './views/RequestsView';
import { ReportsView } from './views/ReportsView';
import type { Filters } from './types';

type View = 'overview' | 'requests' | 'reports';
export function App() {
  const [view, setView] = useState<View>('overview');
  const [menuOpen, setMenuOpen] = useState(() => window.matchMedia('(min-width: 681px)').matches);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [requestFilters, setRequestFilters] = useState<Partial<Filters>>({});
  const [revision, setRevision] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [about, setAbout] = useState(false);
  const [toast, setToast] = useState('');
  const { stats, loading: summaryLoading, error: summaryError } = useStats(revision);
  useEffect(() => {
    const section =
      view === 'overview' ? 'Vista general' : view === 'requests' ? 'Solicitudes' : 'Reportes';
    document.title = `Mesa · Espacio de trabajo / ${section} · Datos de demostración`;
  }, [view]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 681px)');
    const resize = () => setMenuOpen(desktop.matches);
    desktop.addEventListener('change', resize);
    return () => desktop.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menuOpen]);
  function closeMenu() {
    setMenuOpen(false);
    menuButton.current?.focus();
  }
  function openRequests(filters: Partial<Filters>) {
    setRequestFilters(filters);
    navigate('requests');
  }
  function navigate(next: View) {
    setView(next);
    if (window.matchMedia('(max-width: 680px)').matches) closeMenu();
  }
  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : 'menu-closed'}`}>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <aside
        id="main-navigation"
        className={`sidebar ${menuOpen ? 'open' : ''}`}
        aria-label="Navegación principal"
      >
        <button
          ref={menuButton}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Contraer navegación' : 'Expandir navegación'}
          title={menuOpen ? 'Contraer navegación' : 'Expandir navegación'}
          aria-expanded={menuOpen}
          aria-controls="navigation-links"
        >
          <Menu size={20} />
        </button>
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
        <nav id="navigation-links">
          <button
            className={view === 'overview' ? 'active' : ''}
            aria-label="Vista general"
            title="Vista general"
            aria-current={view === 'overview' ? 'page' : undefined}
            onClick={() => navigate('overview')}
          >
            <LayoutDashboard size={18} />
            <span className="nav-text">Vista general</span>
          </button>
          <button
            className={view === 'requests' ? 'active' : ''}
            aria-label="Solicitudes"
            title="Solicitudes"
            aria-current={view === 'requests' ? 'page' : undefined}
            onClick={() => navigate('requests')}
          >
            <ClipboardList size={18} />
            <span className="nav-text">Solicitudes</span>
            <span className="nav-count">{stats?.total ?? '—'}</span>
          </button>
          <button
            className={view === 'reports' ? 'active' : ''}
            aria-label="Reportes"
            title="Reportes"
            aria-current={view === 'reports' ? 'page' : undefined}
            onClick={() => navigate('reports')}
          >
            <FileBarChart2 size={18} />
            <span className="nav-text">Reportes</span>
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
        <main id="main" tabIndex={-1}>
          {import.meta.env.VITE_PUBLIC_DEMO === 'true' && (
            <aside className="demo-notice" aria-label="Sobre los datos de esta demo">
              <strong>Demo pública · datos temporales</strong>
              <p>
                Este espacio es compartido. Usa datos ficticios: otras personas pueden ver y cambiar
                las solicitudes, y los datos pueden restablecerse.
              </p>
            </aside>
          )}
          {view === 'overview' && (
            <OverviewView
              stats={stats}
              loading={summaryLoading}
              error={summaryError}
              onRetry={() => setRevision((value) => value + 1)}
              onCreate={() => setCreating(true)}
              onRequests={openRequests}
              onReports={() => navigate('reports')}
            />
          )}
          {view === 'requests' && (
            <RequestsView
              stats={stats}
              revision={revision}
              initialFilters={requestFilters}
              onCreate={() => setCreating(true)}
              onSelect={setSelected}
            />
          )}
          {view === 'reports' && (
            <ReportsView
              stats={stats}
              summaryLoading={summaryLoading}
              summaryError={summaryError}
              onRetry={() => setRevision((value) => value + 1)}
              revision={revision}
              onExported={setToast}
            />
          )}
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
