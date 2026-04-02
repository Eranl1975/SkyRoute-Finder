'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { searchParamsSchema } from '@/schemas/searchSchema';
import { isoDate } from '@/lib/utils';
import { AIRLINE_REGISTRY } from '@/lib/constants';
import type { SearchParamsInput } from '@/schemas/searchSchema';
import type { StopoverPreference } from '@/types/flight';

interface SearchFormProps {
  onSearch: (params: SearchParamsInput) => void;
  loading?: boolean;
  initialValues?: Partial<SearchParamsInput>;
}

const defaultValues: SearchParamsInput = {
  origin: '',
  destination: '',
  startDate: isoDate(),
  endDate: isoDate(new Date(Date.now() + 7 * 86400000)),
  passengers: 1,
  airlineId: undefined,
  stopoverPreference: 'include_stopovers',
  baggage: {
    checkedBags: 0,
    checkedBagWeightKg: 20,
    trolley: true,
    trolleyCount: 1,
  },
  includeHotel: true,
};

export function SearchForm({ onSearch, loading, initialValues }: SearchFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<SearchParamsInput>({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof SearchParamsInput>(key: K, value: SearchParamsInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = searchParamsSchema.safeParse(values);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        const path = i.path.join('.');
        errs[path] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    onSearch(values);
  }

  const airlineOptions = [
    { value: '', label: t.form.allAirlines },
    ...Object.entries(AIRLINE_REGISTRY).map(([id, a]) => ({ value: id, label: a.name })),
  ];

  const stopoverOptions: { value: StopoverPreference; label: string }[] = [
    { value: 'direct_only',       label: t.form.directOnly },
    { value: 'include_stopovers', label: t.form.includeStopover },
    { value: 'stopovers_only',    label: t.form.stopoversOnly },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Flight search form">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Origin */}
        <Input
          label={t.form.origin}
          placeholder={t.form.originPlaceholder}
          value={values.origin}
          onChange={(e) => set('origin', e.target.value)}
          error={errors.origin}
          required
          autoComplete="off"
        />

        {/* Destination */}
        <Input
          label={t.form.destination}
          placeholder={t.form.destinationPlaceholder}
          value={values.destination}
          onChange={(e) => set('destination', e.target.value)}
          error={errors.destination}
          required
          autoComplete="off"
        />

        {/* Passengers */}
        <Input
          label={t.form.passengers}
          type="number"
          min={1}
          max={9}
          value={values.passengers}
          onChange={(e) => set('passengers', Number(e.target.value))}
          error={errors.passengers}
          required
        />

        {/* Start date */}
        <Input
          label={t.form.startDate}
          type="date"
          value={values.startDate}
          min={isoDate()}
          onChange={(e) => set('startDate', e.target.value)}
          error={errors.startDate}
          required
        />

        {/* End date */}
        <Input
          label={t.form.endDate}
          type="date"
          value={values.endDate}
          min={values.startDate}
          onChange={(e) => set('endDate', e.target.value)}
          error={errors.endDate}
          required
        />

        {/* Airline selector */}
        <Select
          label={t.form.airline}
          value={values.airlineId ?? ''}
          onChange={(e) => set('airlineId', e.target.value || undefined)}
          options={airlineOptions}
        />

        {/* Stopover preference */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">{t.form.stopoverPreference}</label>
          <div className="flex gap-2 flex-wrap" role="group" aria-label={t.form.stopoverPreference}>
            {stopoverOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="stopoverPreference"
                  value={opt.value}
                  checked={values.stopoverPreference === opt.value}
                  onChange={() => set('stopoverPreference', opt.value)}
                  className="accent-sky-500 w-4 h-4"
                />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Checked baggage */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">{t.form.checkedBaggage}</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={values.baggage.checkedBags > 0}
                onChange={(e) =>
                  set('baggage', { ...values.baggage, checkedBags: e.target.checked ? 1 : 0 })
                }
                className="accent-sky-500 w-4 h-4"
              />
              <span className="text-sm text-slate-700">{t.common.yes}</span>
            </label>
            {values.baggage.checkedBags > 0 && (
              <input
                type="number"
                min={1}
                max={5}
                value={values.baggage.checkedBags}
                onChange={(e) =>
                  set('baggage', { ...values.baggage, checkedBags: Number(e.target.value) })
                }
                className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center min-h-[44px]"
                aria-label={t.form.quantity}
              />
            )}
          </div>
        </div>

        {/* Trolley baggage */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">{t.form.trolleyBaggage}</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={values.baggage.trolley}
                onChange={(e) =>
                  set('baggage', { ...values.baggage, trolley: e.target.checked, trolleyCount: e.target.checked ? 1 : 0 })
                }
                className="accent-sky-500 w-4 h-4"
              />
              <span className="text-sm text-slate-700">{t.common.yes}</span>
            </label>
            {values.baggage.trolley && (
              <input
                type="number"
                min={1}
                max={2}
                value={values.baggage.trolleyCount}
                onChange={(e) =>
                  set('baggage', { ...values.baggage, trolleyCount: Number(e.target.value) })
                }
                className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center min-h-[44px]"
                aria-label={t.form.quantity}
              />
            )}
          </div>
        </div>
      </div>

      {/* Include hotel toggle + attraction keyword */}
      <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start">
        <label className="flex items-center gap-2.5 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={values.includeHotel}
            onChange={(e) => set('includeHotel', e.target.checked)}
            className="accent-sky-500 w-4 h-4"
          />
          <span className="text-sm text-slate-700">{t.form.includeHotel}</span>
        </label>
        {values.includeHotel && (
          <Input
            label="Near attraction (optional)"
            placeholder="e.g. Eiffel Tower, Colosseum…"
            value={values.attractionKeyword ?? ''}
            onChange={(e) => set('attractionKeyword', e.target.value || undefined)}
            className="flex-1"
          />
        )}
      </div>

      {/* Submit */}
      <div className="mt-6">
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          aria-label={values.includeHotel ? t.form.searchFlightsAndHotel : t.form.searchFlights}
        >
          ✈ {values.includeHotel ? t.form.searchFlightsAndHotel : t.form.searchFlights}
        </Button>
      </div>
    </form>
  );
}
