"use client";

import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative flex items-center justify-center min-h-screen p-6 overflow-hidden bg-background text-foreground transition-colors duration-700">
      <div className="pointer-events-none select-none">
        <div className="absolute top-[-250px] left-[-250px] w-[700px] h-[700px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-2xl" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>

      <main className="z-10 relative">{children}</main>

      <div className="absolute bottom-0 right-0 hidden xl:block -mb-12 z-10">
        <Image
          src="/welcome.png"
          alt="Seja bem-vindo"
          width={500}
          height={500}
          className="object-contain"
        />
      </div>
    </div>
  );
}
