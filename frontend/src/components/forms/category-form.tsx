"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { useDashboardUI } from "@/contexts/dashboard-ui-provider";
import { createCategory, updateCategory } from "@/lib/api/categories";

const formSchema = z.object({
  name: z.string().min(1, { message: "O nome da categoria é obrigatório." }),
});

interface CategoryFormProps {
  initialData?: { id: number; name: string } | null;
  onSuccess?: () => void;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { closeCategoryForm, notifyCategoryCreated } = useDashboardUI();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ name: initialData.name });
    }
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (initialData) {
        await updateCategory(initialData.id, values);
        toast.success(`Categoria "${values.name}" atualizada com sucesso!`);
      } else {
        const newCategory = await createCategory(values);
        toast.success(`Categoria "${newCategory.name}" criada com sucesso!`);
        notifyCategoryCreated(newCategory);
      }

      if (onSuccess) onSuccess();
      closeCategoryForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar categoria.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Alimentação, Transporte..."
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Salvar Alterações" : "Salvar Categoria"}
        </Button>
      </form>
    </Form>
  );
}
