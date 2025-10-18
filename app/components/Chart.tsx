"use client";

import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Data = {
  name: string;
  price: number;
};

interface ChartProps {
  prices: Data[];
}

export default function Chart({ prices }: ChartProps) {
  if (!prices || prices.length === 0) return null;

  const firstPrice = prices[0].price;
  const lastPrice = prices[prices.length - 1].price;
  const isUp = lastPrice >= firstPrice;

  const strokeColor = isUp ? "#22c55e" : "#ef4444";
  const fillColor = isUp ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)";

  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={prices} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="0 10" />
        <Tooltip />
        <Area type="monotone" dataKey="price" stroke={strokeColor} fill={fillColor} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
