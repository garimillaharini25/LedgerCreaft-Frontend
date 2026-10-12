import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DailyTrend } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface SpendingTrendChartProps {
  data: DailyTrend[];
  currency?: string;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data, currency = 'INR' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-ink-muted">
        No spending recorded for this time period
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date,
    amount: Number(d.amount),
    displayDate: formatDate(d.date),
  }));

  return (
    <div className="h-72 w-full" style={{ minHeight: 280, minWidth: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d5f47" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0d5f47" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e3da40" />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => {
              const parts = val.split('-');
              return `${parts[2]}/${parts[1]}`;
            }}
            stroke="#838a86"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#838a86"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => formatCurrency(val, currency)}
            width={70}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-surface border border-border p-3 rounded-lg shadow-card text-xs">
                    <p className="text-ink-muted font-medium">{item.displayDate}</p>
                    <p className="text-sm font-bold text-accent mt-0.5 tabular-nums">
                      {formatCurrency(item.amount, currency)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0d5f47"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#spendColor)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
