"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createClientProfileAction } from "@/app/actions/auth/createClientProfile";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      setMessage(error.message);
      return;
    }

    const profileResult = await createClientProfileAction({
      fullName,
    });

    setIsLoading(false);

    if (!profileResult.success) {
      setMessage(profileResult.message);
      return;
    }

    setMessage(
      "Cuenta creada correctamente. Ya puedes iniciar sesión."
    );

    setFullName("");
    setEmail("");
    setPassword("");
  }

  return (
    <form className="grid gap-4" onSubmit={handleRegister}>
      <label className="grid gap-2 text-[#1A1A1A] font-bold text-sm">
        Nombre completo
        <input
          type="text"
          placeholder="Tu nombre"
          className="h-12 rounded-[14px] border border-[#E8E0E3] px-4 text-[15px] outline-none"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
      </label>

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
          minLength={6}
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
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
