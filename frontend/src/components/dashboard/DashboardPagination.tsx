"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

interface DashboardPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: "next" | "previous") => void;
}

export function DashboardPagination({
  currentPage,
  totalPages,
  onPageChange,
}: DashboardPaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange("previous")}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
          </PaginationItem>
          <PaginationItem>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange("next")}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
