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
    <section className="w-full">
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Nombre completo
            <input
              name="fullName"
              type="text"
              placeholder="Nombre de la Beluer"
              className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Correo electrónico
            <input
              name="email"
              type="email"
              placeholder="beluer@email.com"
              className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Contraseña temporal
            <input
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
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
              className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Teléfono
            <input
              name="phone"
              type="text"
              placeholder="999 999 999"
              className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Años de experiencia
            <input
              name="experienceYears"
              type="number"
              min="0"
              defaultValue="0"
              className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Distritos de atención
          <input
            name="districts"
            type="text"
            placeholder="Miraflores, San Isidro, Surco"
            className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Bio breve
          <textarea
            name="bio"
            placeholder="Especialista en lashes y/o nails..."
            className="min-h-28 resize-none rounded-[16px] border border-[#E8E0E3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
          />
        </label>

        {state.message ? (
          <p
            className={`rounded-[16px] px-4 py-3 text-sm font-bold ${
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
          className="mt-2 h-12 rounded-full bg-[#E60023] px-6 text-sm font-extrabold text-white transition hover:bg-[#C4001D] disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
        >
          {isPending ? "Creando Beluer..." : "Crear Beluer"}
        </button>
      </form>
    </section>
  );
}