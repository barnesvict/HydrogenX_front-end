import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface MonthlyData {
  month: string;
  electricity: number;
  heat: number;
  oxygen: number;
  opex: number;
  ebitda: number;
}

interface ChartProps {
  data: MonthlyData[];
}

export function MonthlyChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="month" stroke="#aaa" />
        <YAxis stroke="#aaa" />
        <Tooltip />
        <Legend />
        <Bar dataKey="electricity" stackId="a" fill="#4ade80" />
        <Bar dataKey="heat" stackId="a" fill="#60a5fa" />
        <Bar dataKey="oxygen" stackId="a" fill="#f472b6" />
        <Bar dataKey="opex" stackId="a" fill="#fbbf24" />
        <Bar dataKey="ebitda" stackId="a" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  );
}
