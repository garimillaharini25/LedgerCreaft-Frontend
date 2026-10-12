import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PaymentMethodSpending } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PaymentMethodChartProps {
  data: PaymentMethodSpending[];
  currency?: string;
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data, currency = 'INR' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-ink-muted">
        No payment method records for this period
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.displayName,
    amount: Number(d.totalAmount),
    percentage: d.percentage,
    count: d.transactionCount,
  }));

  return (
    <div className="h-72 w-full" style={{ minHeight: 280, minWidth: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e6e3da40" />
          <XAxis
            type="number"
            stroke="#838a86"
            fontSize={12}
            tickFormatter={(val) => formatCurrency(val, currency)}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#838a86"
            fontSize={12}
            width={95}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-surface border border-border p-3 rounded-lg shadow-card text-xs">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="text-accent font-bold mt-1 tabular-nums">
                      {formatCurrency(item.amount, currency)} ({item.percentage.toFixed(1)}%)
                    </p>
                    <p className="text-ink-muted mt-0.5 tabular-nums">{item.count} transaction(s)</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="amount" fill="#0f766e" radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
