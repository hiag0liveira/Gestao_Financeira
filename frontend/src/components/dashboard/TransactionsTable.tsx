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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}

export function TransactionsTable({ transactions, meta, onPageChange }: Props) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
