import { ArrowRight, ArrowUpRight, CheckCheck, ClipboardList, Clock3, Plus } from 'lucide-react';
import type { Filters, Stats, Status } from '../types';
export function OverviewView({
  stats,
  loading,
  error,
  onRetry,
  onCreate,
  onRequests,
  onReports,
}: {
  stats: Stats | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onCreate: () => void;
  onRequests: (filters: Partial<Filters>) => void;
  onReports: () => void;
}) {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">VISTA GENERAL</p>
          <h1>Tus solicitudes, en orden.</h1>
          <p>Un resumen del trabajo y de lo que necesita atención.</p>
        </div>
        <button className="button primary" onClick={onCreate}>
          <Plus size={18} />
          Nueva solicitud
        </button>
      </section>
      {error ? (
        <div className="empty-state" role="alert">
          <h2>No pudimos cargar el resumen</h2>
          <p>{error}</p>
          <button className="button secondary" onClick={onRetry}>
            Volver a intentar
          </button>
        </div>
      ) : loading ? (
        <p className="loading" role="status">
          Cargando resumen…
        </p>
      ) : (
        <>
          <Metrics stats={stats} onFilter={(status) => onRequests({ status })} />
          <section className="report-card">
            <div>
              <p className="eyebrow">PRÓXIMO PASO</p>
              <h2>
                {stats?.pending
                  ? `${stats.pending} solicitudes por atender`
                  : 'Sin solicitudes pendientes'}
              </h2>
              <p>Revisa la bandeja para dar el siguiente paso en cada solicitud.</p>
            </div>
            <button className="button secondary" onClick={() => onRequests({ status: 'pending' })}>
              Revisar pendientes <ArrowRight size={16} />
            </button>
          </section>
        </>
      )}
      <section className="report-card">
        <div>
          <p className="eyebrow">ANÁLISIS Y EXPORTACIÓN</p>
          <h2>Consulta los resultados del espacio</h2>
          <p>
            Explora la distribución por estado y prepara un reporte con el alcance que necesitas.
          </p>
        </div>
        <button className="button secondary" onClick={onReports}>
          Ir a reportes <ArrowRight size={16} />
        </button>
      </section>
    </>
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
