"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteCategory, getCategories } from "@/lib/api/categories";
import { CategoryForm } from "@/components/forms/category-form";

interface Category {
  id: number;
  name: string;
}

interface CategoryManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({
  open,
  onClose,
}: CategoryManagerModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  async function loadCategories() {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch {
      toast.error("Erro ao carregar categorias");
    }
  }

  useEffect(() => {
    if (open) loadCategories();
  }, [open]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await deleteCategory(id);
      toast.success("Categoria excluída com sucesso");
      loadCategories();
    } catch {
      toast.error("Erro ao excluir categoria");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        {editingCategory ? (
          <CategoryForm
            initialData={editingCategory}
            onSuccess={() => {
              setEditingCategory(null);
              loadCategories();
            }}
          />
        ) : (
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nenhuma categoria criada
              </p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between border p-2 rounded"
                >
                  <span>{cat.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingCategory(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
