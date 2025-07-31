"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface Category {
  id: number;
  name: string;
}

interface DashboardUIContextType {
  isTransactionFormOpen: boolean;
  openTransactionForm: () => void;
  closeTransactionForm: () => void;
  isCategoryFormOpen: boolean;
  openCategoryForm: () => void;
  closeCategoryForm: () => void;
  notifyCategoryCreated: (newCategory: Category) => void;
  setCategoryCreatedCallback: (fn: (newCategory: Category) => void) => void;
}

const DashboardUIContext = createContext<DashboardUIContextType | undefined>(
  undefined
);

export function DashboardUIProvider({ children }: { children: ReactNode }) {
  const [isTransactionFormOpen, setTransactionFormOpen] = useState(false);
  const [isCategoryFormOpen, setCategoryFormOpen] = useState(false);

  const [onCategoryCreated, setOnCategoryCreated] = useState<
    ((newCategory: Category) => void) | null
  >(null);

  const value = {
    isTransactionFormOpen,
    openTransactionForm: () => setTransactionFormOpen(true),
    closeTransactionForm: () => setTransactionFormOpen(false),
    isCategoryFormOpen,
    openCategoryForm: () => setCategoryFormOpen(true),
    closeCategoryForm: () => setCategoryFormOpen(false),

    notifyCategoryCreated: useCallback(
      (newCategory: Category) => {
        if (onCategoryCreated) {
          onCategoryCreated(newCategory);
        }
      },
      [onCategoryCreated]
    ),

    setCategoryCreatedCallback: useCallback(
      (fn: (newCategory: Category) => void) => {
        setOnCategoryCreated(() => fn);
      },
      []
    ),
  };

  return (
    <DashboardUIContext.Provider value={value}>
      {children}
    </DashboardUIContext.Provider>
  );
}

export const useDashboardUI = () => {
  const context = useContext(DashboardUIContext);
  if (context === undefined) {
    throw new Error("useDashboardUI must be used within a DashboardUIProvider");
  }
  return context;
};
