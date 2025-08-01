"use client";

import { useEffect, useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  isAfter,
  format,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  ChevronsUpDown,
  DollarSign,
  PlusCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { getBalanceByDateRange } from "@/lib/api/balance";
import { getRangedTransactions } from "@/lib/api/transactions";
import { getCategories } from "@/lib/api/categories";
import { cn } from "@/lib/utils";
import { useDashboardUI } from "@/contexts/dashboard-ui-provider";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthlyBalanceChart } from "@/components/monthly-balance-chart";

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
interface BalanceData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
interface TransactionResponse {
  data: Transaction[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

function BalancePieChart({ data }: { data: BalanceData }) {
  const chartData = useMemo(
    () => [
      { name: "Receitas", value: data.totalIncome },
      { name: "Despesas", value: data.totalExpense },
    ],
    [data]
  );
  const COLORS = ["#10b981", "#ef4444"];

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

function getMonthsInRange(
  start: Date,
  end: Date
): { year: number; month: number }[] {
  const result: { year: number; month: number }[] = [];
  let current = startOfMonth(start);

  while (!isAfter(current, end)) {
    result.push({ year: current.getFullYear(), month: current.getMonth() });
    current = addMonths(current, 1);
  }

  return result;
}

import { getMonthlyBalance } from "@/lib/api/balance";

async function fetchMonthlyBalancesInRange(
  start: Date,
  end: Date,
  categoryIds: number[]
) {
  const months = getMonthsInRange(start, end);

  const promises = months.map(async ({ year, month }) => {
    try {
      const res = await getMonthlyBalance({
        year,
        month: month + 1,
        categoryIds,
      });
      return {
        month: format(new Date(year, month, 1), "MMM/yyyy", { locale: ptBR }),
        balance: res.data.balance,
      };
    } catch {
      return {
        month: format(new Date(year, month, 1), "MMM/yyyy", { locale: ptBR }),
        balance: 0,
      };
    }
  });

  return Promise.all(promises);
}

export default function DashboardPage() {
  const { openTransactionForm, openCategoryForm } = useDashboardUI();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [openCategorySelector, setOpenCategorySelector] = useState(false);

  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [monthlyData, setMonthlyData] = useState<
    { month: string; balance: number }[]
  >([]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await getCategories();
        setAllCategories(response.data);
        setSelectedCategories(response.data);
        setCategoriesLoaded(true);
      } catch (error) {
        toast.error("Erro ao carregar categorias.");
      }
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (!categoriesLoaded || !date?.from || !date?.to) return;

    const fetchData = async () => {
      setIsLoading(true);

      if (!categoriesLoaded || !date?.from || !date?.to) return;

      const params = {
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
        categoryIds: selectedCategories.map((c) => c.id),
        page: currentPage,
        limit: 10,
      };

      const monthly = await fetchMonthlyBalancesInRange(
        date.from,
        date.to,
        selectedCategories.map((c) => c.id)
      );
      setMonthlyData(monthly);

      try {
        const [balanceRes, transactionsRes] = await Promise.all([
          getBalanceByDateRange(params),
          getRangedTransactions(params),
        ]);
        setBalanceData(balanceRes.data);
        setTransactions(transactionsRes.data);
      } catch (error) {
        toast.error("Erro ao buscar dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date, selectedCategories, currentPage, categoriesLoaded]);

  useEffect(() => {
    setCurrentPage(1);
  }, [date, selectedCategories]);

  const handlePageChange = (direction: "next" | "previous") => {
    if (!transactions || !transactions.meta) return;

    const { currentPage, totalPages } = transactions.meta;

    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "previous" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const handleMonthChange = (value: string) => {
    const month = parseInt(value);
    setSelectedMonth(month);
    const newDate = new Date(selectedYear, month);
    setDate({
      from: startOfMonth(newDate),
      to: endOfMonth(newDate),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setDate({
                  from: startOfMonth(new Date()),
                  to: endOfMonth(new Date()),
                })
              }
            >
              Este Mês
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setDate({ from: subDays(new Date(), 30), to: new Date() })
              }
            >
              Últimos 30 dias
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              onValueChange={handleMonthChange}
              defaultValue={String(selectedMonth)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {format(new Date(2000, i, 1), "MMMM", { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                const year = parseInt(value);
                setSelectedYear(year);
                const newDate = new Date(year, selectedMonth);
                setDate({
                  from: startOfMonth(newDate),
                  to: endOfMonth(newDate),
                });
              }}
              defaultValue={String(selectedYear)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <Popover
            open={openCategorySelector}
            onOpenChange={setOpenCategorySelector}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-[250px] justify-between"
              >
                {selectedCategories.length === allCategories.length
                  ? "Todas as categorias"
                  : `${selectedCategories.length} selecionada(s)`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full sm:w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Procurar categoria..." />
                <CommandList>
                  <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedCategories([]);
                        setOpenCategorySelector(false);
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Limpar seleção
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        openCategoryForm();
                        setOpenCategorySelector(false);
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nova Categoria
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    {allCategories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => {
                          setSelectedCategories((prev) =>
                            prev.some((c) => c.id === category.id)
                              ? prev.filter((c) => c.id !== category.id)
                              : [...prev, category]
                          );
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCategories.some((c) => c.id === category.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          onClick={openTransactionForm}
          className="w-full sm:w-auto sm:ml-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receitas (Período)
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balanceData
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(balanceData.totalIncome)
                  : "R$ 0,00"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas (Período)
              </CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balanceData
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(balanceData.totalExpense)
                  : "R$ 0,00"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo (Período)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balanceData
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(balanceData.balance)
                  : "R$ 0,00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balanço do Período</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {balanceData &&
              (balanceData.totalIncome > 0 || balanceData.totalExpense > 0) ? (
                <div className="h-[150px]">
                  <BalancePieChart data={balanceData} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Gráfico do Saldo</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] px-4 pb-6 flex justify-center items-center mt-4">
              {monthlyData?.length > 0 ? (
                <MonthlyBalanceChart data={monthlyData} />
              ) : (
                <span className="text-muted-foreground">Sem dados</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações do Período</CardTitle>
        </CardHeader>
        <CardContent>
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
              {transactions?.data.map((t) => (
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
          <div className="flex items-center justify-end space-x-2 py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange("previous")}
                    disabled={
                      !transactions || transactions.meta.currentPage === 1
                    }
                  >
                    Anterior
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground">
                    Página {transactions?.meta.currentPage ?? 1} de{" "}
                    {transactions?.meta.totalPages ?? 1}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange("next")}
                    disabled={
                      !transactions ||
                      transactions.meta.currentPage ===
                        transactions.meta.totalPages
                    }
                  >
                    Próximo
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
