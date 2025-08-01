"use client";

import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, addMonths, isAfter, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBalanceByDateRange } from "@/lib/api/balance";
import { getRangedTransactions } from "@/lib/api/transactions";
import { getCategories } from "@/lib/api/categories";
import { useDashboardUI } from "@/contexts/dashboard-ui-provider";
import { MonthlyBalanceChart } from "@/components/dashboard/MonthlyBalanceChart";
import { getMonthlyBalance } from "@/lib/api/balance";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardPagination } from "@/components/dashboard/DashboardPagination";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { BalancePieChart } from "@/components/dashboard/BalancePieChart";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";

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
  const { openTransactionForm, openTransactionFormWithData, openCategoryForm } =
    useDashboardUI();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const { setAfterSaveCallback } = useDashboardUI();

  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [monthlyData, setMonthlyData] = useState<
    { month: string; balance: number }[]
  >([]);

  const fetchData = useCallback(async () => {
    if (!categoriesLoaded || !date?.from || !date?.to) return;

    setIsLoading(true);

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
  }, [categoriesLoaded, date, selectedCategories, currentPage]);

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
    setAfterSaveCallback(fetchData);
  }, [fetchData, setAfterSaveCallback]);

  useEffect(() => {
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

  return (
    <div className="flex flex-col gap-4">
      <DashboardFilters
        date={date}
        setDate={setDate}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        openCategoryForm={openCategoryForm}
        openTransactionForm={openTransactionForm}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 grid gap-4">
          <SummaryCard
            title="Receitas (Período)"
            amount={balanceData?.totalIncome ?? 0}
            type="income"
          />

          <SummaryCard
            title="Despesas (Período)"
            amount={balanceData?.totalExpense ?? 0}
            type="expense"
          />

          <SummaryCard
            title="Saldo (Período)"
            amount={balanceData?.balance ?? 0}
            type="balance"
          />

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
          {transactions && (
            <TransactionsTable
              transactions={transactions.data}
              meta={transactions.meta}
              onPageChange={handlePageChange}
              onEdit={(transaction) => openTransactionFormWithData(transaction)}
              onDeleted={fetchData}
            />
          )}

          <DashboardPagination
            currentPage={transactions?.meta.currentPage ?? 1}
            totalPages={transactions?.meta.totalPages ?? 1}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
