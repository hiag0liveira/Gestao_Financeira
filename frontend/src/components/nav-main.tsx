"use client";

import { usePathname } from "next/navigation";
import { Home, LineChart, PackagePlus, PlusCircle } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useDashboardUI } from "@/contexts/dashboard-ui-provider";
import Link from "next/link";

const navLinks = [
  { href: "/", title: "Visão Geral", icon: Home, isLink: true },
  { action: "addTransaction", title: "Nova Transação", icon: PlusCircle },
  { action: "addCategory", title: "Nova Categoria", icon: PackagePlus },
  { href: "#reports", title: "Relatórios", icon: LineChart, isLink: true },
];

export function NavMain() {
  const pathname = usePathname();
  const { openTransactionForm, openCategoryForm } = useDashboardUI();

  const handleAction = (action?: string) => {
    if (action === "addTransaction") openTransactionForm();
    if (action === "addCategory") openCategoryForm();
  };

  return (
    <SidebarMenu>
      {navLinks.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.isLink ? (
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              className={
                pathname === item.href
                  ? "bg-secondary text-secondary-foreground"
                  : ""
              }
            >
              <Link href={item.href!}>
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              tooltip={item.title}
              onClick={() => handleAction(item.action)}
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
