"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

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
import { AnimatedTitle } from "@/components/animated-title";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setCookie } from "cookies-next";
import apiClient from "@/lib/api/axios";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", values);
      const { access_token } = response.data;

      setCookie("auth_token", access_token, { maxAge: 60 * 60 * 24 });
      toast.success("Login realizado com sucesso!");
      router.push("/");
    } catch (error) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl p-8 md:p-10 space-y-6 rounded-xl shadow-lg border bg-card text-card-foreground transition-colors duration-500">
      <AnimatedTitle text="Gestão Financeira" />

      <div className="flex flex-col items-center">
        <div className="mb-6">
          <Image src="/logo.png" alt="Logo" width={220} height={120} />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-bold">Seja Bem-vindo!</h1>
          <p className="text-muted-foreground">
            Acesse sua conta para continuar
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="seu@email.com"
                    className="h-12 text-base rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="h-12 text-base pr-12 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Esconder senha" : "Mostrar senha"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full !mt-6 h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Entrar
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-sm text-center">
        Não tem uma conta?{" "}
        <Link
          href="/register"
          className="underline font-medium text-primary hover:text-primary/80"
        >
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}
