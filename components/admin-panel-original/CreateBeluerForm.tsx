"use client";

import { useActionState } from "react";
import { createBeluerAction } from "@/app/actions/admin/createBeluer";

const initialState = {
  success: false,
  message: "",
};

export default function CreateBeluerForm() {
  const [state, formAction, isPending] = useActionState(
    createBeluerAction,
    initialState
  );

  return (
    <section className="fixed left-6 bottom-6 z-50 max-h-[86vh] w-[380px] overflow-y-auto rounded-[28px] border border-[#E60023]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#E60023]">
        Admin
      </p>

      <h2 className="mb-2 text-2xl font-extrabold leading-none tracking-[-0.04em] text-[#1A1A1A]">
        Crear Beluer
      </h2>

      <p className="mb-5 text-sm leading-relaxed text-[#666]">
        Crea una cuenta y perfil operativo solo para especialistas aprobadas.
      </p>

      <form action={formAction} className="grid gap-3">
        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Nombre completo
          <input
            name="fullName"
            type="text"
            placeholder="Nombre de la Beluer"
            className="h-11 rounded-[14px] border border-[#E8E0E3] px-4 text-sm outline-none"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Correo electrónico
          <input
            name="email"
            type="email"
            placeholder="beluer@email.com"
            className="h-11 rounded-[14px] border border-[#E8E0E3] px-4 text-sm outline-none"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Contraseña temporal
          <input
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            className="h-11 rounded-[14px] border border-[#E8E0E3] px-4 text-sm outline-none"
            required
            minLength={6}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Instagram
          <input
            name="instagram"
            type="text"
            placeholder="@usuario"
            className="h-11 rounded-[14px] border border-[#E8E0E3] px-4 text-sm outline-none"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Teléfono
          <input
            name="phone"
            type="text"
            placeholder="999 999 999"
            className="h-11 rounded-[14px] border border-[#E8E0E3] px-4 text-sm outline-none"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Distritos de atención
          <input
            name="districts"
            type="text"
            placeholder="Miraflores, San Isidro, Surco"
            className="h-11 rounded-[14px] border border-[#E8E0E3] px-4 text-sm outline-none"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Años de experiencia
          <input
            name="experienceYears"
            type="number"
            min="0"
            defaultValue="0"
            className="h-11 rounded-[14px] border border-[#E8E0E3] px-4 text-sm outline-none"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Bio breve
          <textarea
            name="bio"
            placeholder="Especialista en lashes y/o nails..."
            className="min-h-20 rounded-[14px] border border-[#E8E0E3] px-4 py-3 text-sm outline-none"
          />
        </label>

        {state.message ? (
          <p
            className={`rounded-[14px] px-4 py-3 text-sm font-bold ${
              state.success
                ? "bg-green-50 text-green-700"
                : "bg-[#FFD6E2] text-[#E60023]"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 h-11 rounded-full bg-[#E60023] text-sm font-extrabold text-white transition hover:bg-[#C4001D] disabled:opacity-60"
        >
          {isPending ? "Creando Beluer..." : "Crear Beluer"}
        </button>
      </form>
    </section>
  );
}