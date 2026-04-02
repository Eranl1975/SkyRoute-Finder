'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { AIRPORTS } from '@/data/airports';
import type { Airport } from '@/data/airports';
import { cn } from '@/lib/utils';

interface AirportInputProps {
  label: string;
  value: string;            // IATA code stored in form state
  onChange: (iata: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

function getDisplay(iata: string): string {
  if (!iata) return '';
  const a = AIRPORTS.find((x) => x.iata === iata.toUpperCase());
  return a ? `${a.iata} — ${a.city}` : iata;
}

export function AirportInput({ label, value, onChange, placeholder, error, required }: AirportInputProps) {
  const [query, setQuery] = useState(() => getDisplay(value));
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = label.toLowerCase().replace(/\s+/g, '-');

  // Sync display text when value is set externally
  useEffect(() => {
    setQuery(getDisplay(value));
  }, [value]);

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.iata.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().startsWith(q)
    ).slice(0, 8);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    setHighlighted(0);
    if (!v) onChange('');
  }

  function select(airport: Airport) {
    setQuery(`${airport.iata} — ${airport.city}`);
    onChange(airport.iata);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
      </label>

      <input
        id={inputId}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => { if (query.length >= 2) setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'City or IATA code (e.g. TLV, London)'}
        autoComplete="off"
        required={required}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${inputId}-listbox`}
        aria-activedescendant={open && suggestions[highlighted] ? `${inputId}-opt-${highlighted}` : undefined}
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900',
          'bg-white placeholder:text-slate-400',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
          'min-h-[44px]',
          error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 hover:border-slate-300'
        )}
      />

      {error && (
        <p className="text-xs text-red-600" role="alert">{error}</p>
      )}

      {open && suggestions.length > 0 && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          aria-label={label}
          className="absolute top-full mt-1 z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
        >
          {suggestions.map((airport, i) => (
            <li
              key={airport.iata}
              id={`${inputId}-opt-${i}`}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={(e) => { e.preventDefault(); select(airport); }}
              onMouseEnter={() => setHighlighted(i)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                i === highlighted ? 'bg-sky-50' : 'hover:bg-slate-50'
              )}
            >
              <span className="font-mono font-bold text-sky-600 text-sm w-10 shrink-0">
                {airport.iata}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-slate-800 font-medium truncate">
                  {airport.city}
                </span>
                <span className="block text-xs text-slate-400 truncate">
                  {airport.name} · {airport.country}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
