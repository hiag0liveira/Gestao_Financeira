import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  type: "income" | "expense" | "balance";
}

export function SummaryCard({ title, amount, type }: SummaryCardProps) {
  const icon =
    type === "income" ? (
      <ArrowUpCircle className="h-4 w-4 text-green-500" />
    ) : type === "expense" ? (
      <ArrowDownCircle className="h-4 w-4 text-red-500" />
    ) : (
      <DollarSign className="h-4 w-4 text-muted-foreground" />
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold",
            type === "income"
              ? "text-green-600"
              : type === "expense"
              ? "text-red-600"
              : ""
          )}
        >
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
