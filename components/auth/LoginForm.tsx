"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const redirectTo = searchParams.get("redirectTo");

    if (redirectTo?.startsWith("/app/")) {
      router.push(redirectTo);
      return;
    }

    const role = data.user?.app_metadata?.role ?? "cliente";

    if (role === "admin") {
      router.push("/app/admin");
      return;
    }

    if (role === "beluer") {
      router.push("/app/beluer");
      return;
    }

    router.push("/app/cliente");
  }

  return (
    <form className="grid gap-4" onSubmit={handleLogin}>
      <label className="grid gap-2 text-[#1A1A1A] font-bold text-sm">
        Correo electrónico
        <input
          type="email"
          placeholder="tu@email.com"
          className="h-12 rounded-[14px] border border-[#E8E0E3] px-4 text-[15px] outline-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="grid gap-2 text-[#1A1A1A] font-bold text-sm">
        Contraseña
        <input
          type="password"
          placeholder="••••••••"
          className="h-12 rounded-[14px] border border-[#E8E0E3] px-4 text-[15px] outline-none"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {message ? (
        <p className="rounded-[14px] bg-[#FFD6E2] px-4 py-3 text-sm font-bold text-[#E60023]">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="h-[50px] rounded-full bg-[#E60023] text-white font-extrabold text-[15px] mt-2 disabled:opacity-60"
      >
        {isLoading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}