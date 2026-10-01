import { Search, SlidersHorizontal, X } from 'lucide-react';
import { categories, priorityLabels, type Category, type Priority } from '../types';
import type { useRequestFilters } from '../useRequestFilters';
export function RequestFilters({
  filters,
  search,
  setSearch,
  changeFilter,
  filtered,
  clear,
}: ReturnType<typeof useRequestFilters>) {
  return (
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
        <label className="date-filter">
          <span>Desde</span>
          <input
            aria-label="Fecha de creación desde"
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(e) => changeFilter('dateFrom', e.target.value)}
          />
        </label>
        <label className="date-filter">
          <span>Hasta</span>
          <input
            aria-label="Fecha de creación hasta"
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(e) => changeFilter('dateTo', e.target.value)}
          />
        </label>
        {filtered && (
          <button className="clear-filters" onClick={clear}>
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
