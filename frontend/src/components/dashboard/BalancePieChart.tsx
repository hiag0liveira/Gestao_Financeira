"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface BalanceData {
  totalIncome: number;
  totalExpense: number;
}

const COLORS = ["#10b981", "#ef4444"];

export function BalancePieChart({ data }: { data: BalanceData }) {
  const chartData = useMemo(
    () => [
      { name: "Receitas", value: data.totalIncome },
      { name: "Despesas", value: data.totalExpense },
    ],
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            percent !== undefined
              ? `${name} ${(percent * 100).toFixed(0)}%`
              : name
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value)
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
