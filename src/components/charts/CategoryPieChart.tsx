import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { CategorySpending } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CategoryPieChartProps {
  data: CategorySpending[];
  currency?: string;
}

const HARMONIOUS_COLORS = [
  '#0d5f47', '#2563eb', '#d97706', '#dc2626', '#9333ea',
  '#0284c7', '#16a34a', '#475569', '#65a30d', '#0f766e',
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, currency = 'INR' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-ink-muted">
        No category spending recorded for this time period
      </div>
    );
  }

  const chartData = data.map((d, index) => ({
    name: d.categoryName,
    value: Number(d.totalAmount),
    percentage: d.percentage,
    color: d.categoryColor || HARMONIOUS_COLORS[index % HARMONIOUS_COLORS.length],
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-72" style={{ minHeight: 280, minWidth: 200 }}>
      <div className="h-64 w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-surface border border-border p-3 rounded-lg shadow-card text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-ink">{item.name}</span>
                      </div>
                      <p className="font-bold text-ink mt-1 tabular-nums">
                        {formatCurrency(item.value, currency)} ({item.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="w-full sm:w-1/2 max-h-56 overflow-y-auto space-y-2 pr-2">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-0.5">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-ink-secondary truncate">{item.name}</span>
            </div>
            <div className="font-semibold text-ink shrink-0 tabular-nums">
              {formatCurrency(item.value, currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
