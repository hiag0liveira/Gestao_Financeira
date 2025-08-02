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

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "income" | "expense" | "fixed-expense";
  category: Category;
  recurrenceEndDate?: string;
}

interface DashboardUIContextType {
  isTransactionFormOpen: boolean;
  openTransactionForm: () => void;
  openTransactionFormWithData: (transaction: Transaction) => void;
  closeTransactionForm: () => void;
  editingTransaction: Transaction | null;
  clearEditingTransaction: () => void;

  setAfterSaveCallback: (fn: () => void) => void;
  afterSave?: () => void;

  isCategoryFormOpen: boolean;
  openCategoryForm: () => void;
  closeCategoryForm: () => void;

  isCategoryManagerOpen: boolean;
  openCategoryManager: () => void;
  closeCategoryManager: () => void;

  notifyCategoryCreated: (newCategory: Category) => void;
  setCategoryCreatedCallback: (fn: (newCategory: Category) => void) => void;
}

const DashboardUIContext = createContext<DashboardUIContextType | undefined>(
  undefined
);

export function DashboardUIProvider({ children }: { children: ReactNode }) {
  const [isTransactionFormOpen, setTransactionFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [afterSave, setAfterSave] = useState<(() => void) | null>(null);

  const [isCategoryFormOpen, setCategoryFormOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);

  const [onCategoryCreated, setOnCategoryCreated] = useState<
    ((newCategory: Category) => void) | null
  >(null);

  const value: DashboardUIContextType = {
    isTransactionFormOpen,
    openTransactionForm: () => {
      setEditingTransaction(null);
      setTransactionFormOpen(true);
    },
    openTransactionFormWithData: (transaction) => {
      setEditingTransaction(transaction);
      setTransactionFormOpen(true);
    },
    closeTransactionForm: () => setTransactionFormOpen(false),
    editingTransaction,
    clearEditingTransaction: () => setEditingTransaction(null),

    setAfterSaveCallback: (fn) => setAfterSave(() => fn),
    afterSave: afterSave ?? undefined,

    isCategoryFormOpen,
    openCategoryForm: () => setCategoryFormOpen(true),
    closeCategoryForm: () => setCategoryFormOpen(false),

    isCategoryManagerOpen,
    openCategoryManager: () => setCategoryManagerOpen(true),
    closeCategoryManager: () => setCategoryManagerOpen(false),

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
