"use client";

import { DateRange } from "react-day-picker";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronsUpDown, Check, XCircle, PlusCircle } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Category {
  id: number;
  name: string;
}

interface DashboardFiltersProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedCategories: Category[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  allCategories: Category[];
  openCategoryForm: () => void;
  openTransactionForm: () => void;
}

export function DashboardFilters({
  date,
  setDate,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedCategories,
  setSelectedCategories,
  allCategories,
  openCategoryForm,
  openTransactionForm,
}: DashboardFiltersProps) {
  const [openCategorySelector, setOpenCategorySelector] = useState(false);

  const handleMonthChange = (value: string) => {
    const month = parseInt(value);
    setSelectedMonth(month);
    const newDate = new Date(selectedYear, month);
    setDate({
      from: startOfMonth(newDate),
      to: endOfMonth(newDate),
    });
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value);
    setSelectedYear(year);
    const newDate = new Date(year, selectedMonth);
    setDate({
      from: startOfMonth(newDate),
      to: endOfMonth(newDate),
    });
  };

  const categoriesWithNA = [
    { id: -1, name: "Sem categoria" },
    ...allCategories,
  ];

  return (
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
            onValueChange={handleYearChange}
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
                  {categoriesWithNA.map((category) => (
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

        <Button
          onClick={openTransactionForm}
          className="sm:ml-auto w-full sm:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>
    </div>
  );
}
