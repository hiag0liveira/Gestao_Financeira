"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CurrencyInput from "react-currency-input-field";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDashboardUI } from "@/contexts/dashboard-ui-provider";
import { getCategories } from "@/lib/api/categories";
import { createTransaction, updateTransaction } from "@/lib/api/transactions";
import { cn } from "@/lib/utils";

enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  FIXED_EXPENSE = "fixed-expense",
}

const transactionFormSchema = z.object({
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  amount: z
    .string()
    .min(1, "O valor é obrigatório.")
    .refine(
      (value) => {
        const numberValue = parseFloat(
          value.replace(/\./g, "").replace(",", ".")
        );
        return !isNaN(numberValue) && numberValue > 0;
      },
      { message: "O valor deve ser maior que zero." }
    ),
  date: z.date(),
  type: z.nativeEnum(TransactionType),
  categoryId: z.coerce
    .number()
    .min(1, "Por favor, selecione uma categoria.") as z.ZodType<
    number,
    any,
    any
  >,
  recurrenceEndDate: z.date().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface Category {
  id: number;
  name: string;
}

interface TransactionFormProps {
  onSaved?: () => void;
}

export function TransactionForm({ onSaved }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const {
    closeTransactionForm,
    openCategoryForm,
    editingTransaction,
    clearEditingTransaction,
  } = useDashboardUI();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: editingTransaction?.description || "",
      amount: editingTransaction
        ? String(editingTransaction.amount).replace(".", ",")
        : "",
      date: editingTransaction ? new Date(editingTransaction.date) : new Date(),
      type:
        (editingTransaction?.type as TransactionType) ||
        TransactionType.EXPENSE,
      categoryId: editingTransaction?.category?.id || undefined,
      recurrenceEndDate: editingTransaction?.recurrenceEndDate
        ? new Date(editingTransaction.recurrenceEndDate)
        : undefined,
    },
  });

  const { afterSave } = useDashboardUI();

  const transactionType = form.watch("type");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await getCategories();
        setCategories(response.data);

        const currentCategoryId = form.getValues("categoryId");
        if (
          (!currentCategoryId || currentCategoryId <= 0) &&
          response.data.length > 0
        ) {
          form.setValue("categoryId", response.data[0].id);
        }
      } catch (error) {
        toast.error("Erro ao carregar categorias.");
      }
    }

    fetchCategories();
  }, [form]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await getCategories();
        setCategories(response.data);

        if (response.data.length > 0) {
          form.setValue("categoryId", response.data[0].id);
        }
      } catch (error) {
        toast.error("Erro ao carregar categorias.");
      }
    }
    fetchCategories();
  }, []);

  async function onSubmit(values: TransactionFormValues) {
    setIsLoading(true);
    try {
      const numericAmount = parseFloat(
        values.amount.replace(/\./g, "").replace(",", ".")
      );
      const payload = {
        description: values.description,
        amount: numericAmount,
        date: format(values.date, "yyyy-MM-dd"),
        type: values.type,
        categoryId: values.categoryId,
        ...(values.type === TransactionType.FIXED_EXPENSE && {
          recurrenceDay: values.date.getDate(),
          recurrenceEndDate: values.recurrenceEndDate
            ? format(values.recurrenceEndDate, "yyyy-MM-dd")
            : undefined,
        }),
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
        toast.success("Transação atualizada com sucesso!");
      } else {
        await createTransaction(payload as any);
        toast.success("Transação registrada com sucesso!");
      }

      if (afterSave) {
        afterSave();
      }

      clearEditingTransaction();
      closeTransactionForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar transação.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Aluguer, Supermercado..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <CurrencyInput
                  id="amount"
                  name={field.name}
                  placeholder="R$ 0,00"
                  defaultValue={field.value}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  prefix="R$ "
                  onValueChange={(value) => field.onChange(value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={field.onChange}
                  value={field.value ? String(field.value) : ""}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-auto">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={openCategoryForm}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Transação</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-4 pt-2"
                  disabled={isLoading}
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={TransactionType.EXPENSE} />
                    </FormControl>
                    <FormLabel className="font-normal">Despesa</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={TransactionType.INCOME} />
                    </FormControl>
                    <FormLabel className="font-normal">Receita</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={TransactionType.FIXED_EXPENSE} />
                    </FormControl>
                    <FormLabel className="font-normal">Despesa Fixa</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {transactionType === TransactionType.FIXED_EXPENSE
                  ? "Data da Primeira Cobrança"
                  : "Data da Transação"}
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {transactionType === TransactionType.FIXED_EXPENSE && (
          <FormField
            control={form.control}
            name="recurrenceEndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Final da Recorrência (opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Transação
        </Button>
      </form>
    </Form>
  );
}
