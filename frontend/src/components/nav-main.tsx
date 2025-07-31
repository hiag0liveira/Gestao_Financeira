"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, LineChart, Package } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navLinks = [
  { href: "/dashboard", title: "Dashboard", icon: Home },
  { href: "/dashboard/transactions", title: "Transações", icon: ShoppingCart },
  { href: "/dashboard/reports", title: "Relatórios", icon: LineChart },
  { href: "/dashboard/categories", title: "Categorias", icon: Package },
];

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navLinks.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            tooltip={item.title}
            className={
              pathname === item.href
                ? "bg-secondary text-secondary-foreground"
                : ""
            }
          >
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
