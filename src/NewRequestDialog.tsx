import { useState, type FormEvent } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { api } from './api';
import { Dialog } from './Dialog';
import { categories, priorityLabels, type Category, type Priority } from './types';

export function NewRequestDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: number) => void;
}) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const fields = new FormData(event.currentTarget);
    setSaving(true);
    setError('');
    try {
      const created = await api.create({
        title: String(fields.get('title')).trim(),
        description: String(fields.get('description')).trim(),
        requester: String(fields.get('requester')).trim(),
        category: fields.get('category') as Category,
        priority: fields.get('priority') as Priority,
      });
      onCreated(created.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo crear la solicitud.');
      setSaving(false);
    }
  }
  return (
    <Dialog
      title="Una nueva solicitud"
      subtitle="Cuéntanos qué necesitas. Le daremos seguimiento aquí."
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="form-body">
          <label>
            Asunto <span>*</span>
            <input
              name="title"
              required
              minLength={3}
              maxLength={100}
              placeholder="Ej. Revisar acceso al panel de reportes"
              data-initial-focus
            />
          </label>
          <label>
            Solicitante <span>*</span>
            <input
              name="requester"
              required
              minLength={3}
              maxLength={70}
              placeholder="Nombre de la persona o del equipo"
            />
          </label>
          <div className="form-row">
            <label>
              Categoría <span>*</span>
              <select name="category" defaultValue="Soporte">
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Prioridad <span>*</span>
              <select name="priority" defaultValue="medium">
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Descripción <span>*</span>
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={1500}
              rows={4}
              placeholder="Incluye el contexto necesario para atender la solicitud."
            />
          </label>
          <p className="field-hint">
            Se registrará como pendiente. Todos los campos son obligatorios.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <footer className="dialog-footer">
          <button type="button" className="button secondary" disabled={saving} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button primary" disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={17} /> : <ArrowRight size={17} />}
            {saving ? 'Guardando…' : 'Crear solicitud'}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
