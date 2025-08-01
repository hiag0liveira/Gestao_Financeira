"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTransaction } from "@/lib/api/transactions";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "income" | "expense" | "fixed-expense";
  category: Category;
}

interface Meta {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

interface Props {
  transactions: Transaction[];
  meta: Meta;
  onPageChange: (direction: "next" | "previous") => void;
  onEdit: (transaction: Transaction) => void;
  onDeleted?: () => void;
}

export function TransactionsTable({
  transactions,
  meta,
  onPageChange,
  onEdit,
  onDeleted,
}: Props) {
  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

    try {
      await deleteTransaction(id);
      toast.success("Transação excluída com sucesso!");
      if (onDeleted) onDeleted();
    } catch {
      toast.error("Erro ao excluir transação.");
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.description}</TableCell>
              <TableCell>{t.category?.name || "N/A"}</TableCell>
              <TableCell>
                {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  t.type === "income" ? "text-green-500" : "text-red-500"
                )}
              >
                {t.type === "income" ? "+" : "-"}{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(t.amount)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(t)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
