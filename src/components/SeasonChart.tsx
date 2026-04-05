import React from 'react';

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface SeasonChartProps {
  data: Record<number, number>;
}

export const SeasonChart = React.memo(function SeasonChart({ data }: SeasonChartProps) {
  const values = MONTH_LABELS.map((_, i) => data[i + 1] || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
      <h3 className="text-base font-bold text-gray-900 mb-1">Estacionalidad</h3>
      <p className="text-xs text-gray-400 mb-4">Observaciones por mes en Chile</p>
      <div className="flex items-end gap-1.5 h-24">
        {values.map((v, i) => {
          const height = max > 0 ? (v / max) * 100 : 0;
          const intensity = height > 66 ? 'bg-emerald-600' : height > 33 ? 'bg-emerald-400' : 'bg-emerald-200';
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-sm ${v > 0 ? intensity : 'bg-gray-100'} transition-all`}
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${MONTH_LABELS[i]}: ${v.toLocaleString('es-CL')} obs.`}
              />
              <span className="text-[9px] text-gray-400 leading-none">{MONTH_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
