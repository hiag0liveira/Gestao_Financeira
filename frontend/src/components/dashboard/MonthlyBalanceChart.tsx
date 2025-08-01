import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyBalance {
  month: string;
  balance: number;
}

export function MonthlyBalanceChart({ data }: { data: MonthlyBalance[] }) {
  return (
    <ResponsiveContainer width="90%" aspect={1.8}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
      >
        {" "}
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }).format(value)
          }
        />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value)
          }
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#00bfa5"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
