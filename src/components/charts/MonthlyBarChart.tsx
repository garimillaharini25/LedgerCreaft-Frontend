import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MonthlyComparison } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyBarChartProps {
  data: MonthlyComparison[];
  currency?: string;
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ data, currency = 'INR' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-ink-muted">
        No monthly history available yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.monthName,
    spent: Number(d.totalSpent),
    budget: Number(d.budgetAmount),
  }));

  return (
    <div className="h-72 w-full" style={{ minHeight: 280, minWidth: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e3da40" />
          <XAxis dataKey="name" stroke="#838a86" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#838a86"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => formatCurrency(val, currency)}
            width={70}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-surface border border-border p-3 rounded-lg shadow-card text-xs space-y-1">
                    <p className="font-semibold text-ink">{label}</p>
                    <p className="text-accent font-medium tabular-nums">
                      Spent: {formatCurrency(Number(payload[0]?.value || 0), currency)}
                    </p>
                    {payload[1] && (
                      <p className="text-ink-muted font-medium tabular-nums">
                        Budget: {formatCurrency(Number(payload[1]?.value || 0), currency)}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-xs text-ink-secondary font-medium">{value}</span>}
          />
          <Bar dataKey="spent" name="Actual Spent" fill="#0d5f47" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="budget" name="Budget Limit" fill="#d4cfc3" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
