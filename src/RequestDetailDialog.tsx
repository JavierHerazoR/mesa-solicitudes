import { useEffect, useState } from 'react';
import { ArrowRight, Check, LoaderCircle, RotateCcw } from 'lucide-react';
import { api } from './api';
import { Dialog } from './Dialog';
import { priorityLabels, statusLabels, type RequestDetail, type Status } from './types';

const dates = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});
export function RequestDetailDialog({
  id,
  onClose,
  onUpdated,
}: {
  id: number;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    api
      .detail(id, controller.signal)
      .then(setDetail)
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason.message);
      });
    return () => controller.abort();
  }, [id]);
  async function change(status: Status) {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      setDetail(await api.changeStatus(id, status, note.trim()));
      setNote('');
      onUpdated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo actualizar la solicitud.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      title={detail?.code || 'Detalle de solicitud'}
      subtitle="Cada avance queda registrado."
      onClose={() => {
        if (!saving) onClose();
      }}
      wide
    >
      {!detail && !error && (
        <div className="loading">
          <LoaderCircle className="spin" size={24} /> Cargando solicitud…
        </div>
      )}
      {error && (
        <p className="error detail-error" role="alert">
          {error}
        </p>
      )}
      {detail && (
        <div className="detail-body">
          <div className="detail-badges">
            <span className={`status ${detail.status}`}>
              <i />
              {statusLabels[detail.status]}
            </span>
            <span className={`priority ${detail.priority}`}>
              <i />
              Prioridad {priorityLabels[detail.priority].toLowerCase()}
            </span>
          </div>
          <h3 className="detail-title">{detail.title}</h3>
          <p className="description">{detail.description}</p>
          <dl className="detail-meta">
            <div>
              <dt>Solicitante</dt>
              <dd>{detail.requester}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{detail.category}</dd>
            </div>
            <div>
              <dt>Fecha de registro</dt>
              <dd>{dates.format(new Date(detail.createdAt))}</dd>
            </div>
          </dl>
          <section className="action-section">
            <h3>Siguiente paso</h3>
            <p>
              {detail.status === 'pending'
                ? 'Empieza a atender esta solicitud.'
                : detail.status === 'in_progress'
                  ? 'Registra la solución para completar el seguimiento.'
                  : 'Puedes reabrirla si requiere una nueva revisión.'}
            </p>
            <label className="note-label" htmlFor="status-note">
              Nota del cambio <span>(opcional)</span>
            </label>
            <textarea
              id="status-note"
              rows={2}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Acceso habilitado y verificado con el solicitante."
              disabled={saving}
            />
            <button
              className="button primary"
              disabled={saving}
              onClick={() => change(detail.status === 'in_progress' ? 'resolved' : 'in_progress')}
            >
              {saving ? (
                <LoaderCircle size={17} className="spin" />
              ) : detail.status === 'resolved' ? (
                <RotateCcw size={17} />
              ) : detail.status === 'in_progress' ? (
                <Check size={17} />
              ) : (
                <ArrowRight size={17} />
              )}
              {saving
                ? 'Guardando…'
                : detail.status === 'resolved'
                  ? 'Reabrir solicitud'
                  : detail.status === 'in_progress'
                    ? 'Marcar como resuelta'
                    : 'Iniciar atención'}
            </button>
          </section>
          <section className="history">
            <h3>Historial de la solicitud</h3>
            <ol>
              {detail.history.map((event) => (
                <li key={event.id}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>
                      {event.fromStatus
                        ? `${statusLabels[event.fromStatus]} → ${statusLabels[event.toStatus]}`
                        : 'Solicitud creada'}
                    </strong>
                    <time dateTime={event.createdAt}>
                      {dates.format(new Date(event.createdAt))}
                    </time>
                    {event.note && <p>{event.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </Dialog>
  );
}
