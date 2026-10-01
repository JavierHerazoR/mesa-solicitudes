import { useState } from 'react';
import { ArrowDownToLine, LoaderCircle } from 'lucide-react';
import { filterParams } from '../api';
import { statusLabels, type Stats, type Status } from '../types';
import { useRequests } from '../useRequests';
import { useRequestFilters } from '../useRequestFilters';
import { RequestFilters } from '../components/RequestFilters';
export function ReportsView({
  stats,
  summaryLoading,
  summaryError,
  onRetry,
  revision,
  onExported,
}: {
  stats: Stats | null;
  summaryLoading: boolean;
  summaryError: string;
  onRetry: () => void;
  revision: number;
  onExported: (message: string) => void;
}) {
  const controls = useRequestFilters();
  const { filters, search, changeFilter } = controls;
  const [attempt, retry] = useState(0);
  const { data, loading, error } = useRequests(filters, 1, revision + attempt);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const updating = loading || search.trim() !== filters.search.trim();
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
      onExported('Reporte descargado con los filtros seleccionados.');
    } catch (reason) {
      setExportError(reason instanceof Error ? reason.message : 'No se pudo descargar el reporte.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">REPORTES</p>
          <h1>Del seguimiento a los datos.</h1>
          <p>Analiza el estado del espacio y descarga las solicitudes que necesitas.</p>
        </div>
      </section>
      {summaryError ? (
        <div className="empty-state" role="alert">
          <h2>No pudimos cargar la distribución</h2>
          <p>{summaryError}</p>
          <button className="button secondary" onClick={onRetry}>
            Volver a intentar
          </button>
        </div>
      ) : summaryLoading ? (
        <p className="loading" role="status">
          Cargando distribución…
        </p>
      ) : (
        <>
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

          {stats?.total === 0 && (
            <p className="report-empty">Aún no hay solicitudes para analizar.</p>
          )}
        </>
      )}
      <section className="requests-panel" aria-labelledby="report-title">
        <div className="panel-title">
          <div>
            <h2 id="report-title">Prepara tu reporte</h2>
            <p>
              Elige qué solicitudes incluir. El gráfico superior siempre muestra todo el espacio.
            </p>
          </div>
        </div>
        <div className="report-status">
          <label>
            Estado del reporte{' '}
            <select
              value={filters.status}
              onChange={(event) => changeFilter('status', event.target.value as '' | Status)}
            >
              <option value="">Todos los estados</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <RequestFilters {...controls} />
        <div className="report-export">
          {error ? (
            <div role="alert">
              <p>{error}</p>
              <button className="button secondary" onClick={() => retry((value) => value + 1)}>
                Volver a intentar
              </button>
            </div>
          ) : (
            <div aria-live="polite">
              <strong>
                {updating ? 'Calculando alcance…' : `${data?.total ?? 0} solicitudes en el reporte`}
              </strong>
              <p>El CSV incluye todas las coincidencias, sin límite de página.</p>
              {!updating && data?.total === 0 && (
                <p>Ajusta los filtros para encontrar solicitudes.</p>
              )}
            </div>
          )}
          <button
            className="button primary"
            disabled={exporting || updating || !!error || !data?.total}
            onClick={exportCsv}
          >
            {exporting ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <ArrowDownToLine size={16} />
            )}{' '}
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
        </div>
        {exportError && (
          <p className="error export-error" role="alert">
            {exportError}
          </p>
        )}
      </section>
    </>
  );
}
