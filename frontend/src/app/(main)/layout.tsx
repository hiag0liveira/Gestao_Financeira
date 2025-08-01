"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/auth-provider";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DashboardUIProvider,
  useDashboardUI,
} from "@/contexts/dashboard-ui-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/forms/category-form";
import { TransactionForm } from "@/components/forms/transaction-form";

const breadcrumbNameMap: { [key: string]: string } = {
  "/": "Dashboard",
};

function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentBreadcrumb = breadcrumbNameMap[pathname] || "Dashboard";
  const {
    isTransactionFormOpen,
    closeTransactionForm,
    isCategoryFormOpen,
    closeCategoryForm,
  } = useDashboardUI();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 bg-background px-4 rounded-lg ">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentBreadcrumb}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>

      <Dialog open={isTransactionFormOpen} onOpenChange={closeTransactionForm}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para registar uma nova transação.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryFormOpen} onOpenChange={closeCategoryForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar as suas transações.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DashboardUIProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </DashboardUIProvider>
    </AuthProvider>
  );
}
