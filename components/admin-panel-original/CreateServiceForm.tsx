"use client";

import { useActionState } from "react";
import { createServiceAction } from "@/app/actions/admin/createService";

const initialState = {
  success: false,
  message: "",
};

export default function CreateServiceForm() {
  const [state, formAction, isPending] = useActionState(
    createServiceAction,
    initialState
  );

  return (
    <details className="mb-6 rounded-[1.5rem] border border-[#FFD6E2] bg-[#FFF7F9] p-5">
      <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.16em] text-[#E60023]">
        Añadir servicio
      </summary>

      <form action={formAction} className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Nombre del servicio
            <input
              name="name"
              type="text"
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E60023]"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Categoria
            <select
              name="category"
              defaultValue="lashes"
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E60023]"
              required
            >
              <option value="lashes">Lashes</option>
              <option value="nails">Nails</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Descripcion
          <textarea
            name="description"
            className="min-h-20 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#E60023]"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Precio publico
            <input
              name="publicPrice"
              type="number"
              min="0"
              step="0.01"
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E60023]"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Cargo logistico
            <input
              name="logisticFee"
              type="number"
              min="0"
              step="0.01"
              defaultValue="10"
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E60023]"
              required
            />
          </label>

          <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
            <p className="font-bold text-[#1A1A1A]">Precio base</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Se calcula automaticamente en la base.
            </p>
          </div>

          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Duracion
            <input
              name="durationMinutes"
              type="number"
              min="1"
              step="1"
              defaultValue="90"
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E60023]"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr]">
          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Estado
            <select
              name="status"
              defaultValue="active"
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E60023]"
              required
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-[#1A1A1A]">
            <input
              name="isFeatured"
              type="checkbox"
              value="true"
              className="h-4 w-4 accent-[#E60023]"
            />
            Destacado
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
            Foto del servicio
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#FFD6E2] file:px-3 file:py-1 file:text-xs file:font-black file:text-[#E60023]"
            />
          </label>
        </div>

        {state.message ? (
          <p
            className={`rounded-xl px-4 py-3 text-sm font-bold ${
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
          className="h-11 rounded-full bg-[#E60023] px-5 text-sm font-black text-white transition hover:bg-[#C4001D] disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
        >
          {isPending ? "Creando servicio..." : "Crear servicio"}
        </button>
      </form>
    </details>
  );
}
