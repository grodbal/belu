"use client";

import { useActionState } from "react";
import { updateServiceAction } from "@/app/actions/admin/updateService";

const initialState = {
  success: false,
  message: "",
};

type EditServiceFormProps = {
  serviceId: string;
  category: "lashes" | "nails";
  name: string;
  description: string;
  publicPrice: number;
  logisticFee: number;
  durationMinutes: number;
};

export default function EditServiceForm({
  serviceId,
  category,
  name,
  description,
  publicPrice,
  logisticFee,
  durationMinutes,
}: EditServiceFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateServiceAction,
    initialState
  );

  return (
    <details className="rounded-2xl border border-neutral-100 bg-white p-4">
      <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
        Editar servicio
      </summary>

      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="serviceId" value={serviceId} />

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Nombre
          <input
            name="name"
            defaultValue={name}
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
            required
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Categoría
          <select
            name="category"
            defaultValue={category}
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
            required
          >
            <option value="lashes">Lashes</option>
            <option value="nails">Nails</option>
          </select>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
            Precio público
            <input
              name="publicPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={publicPrice}
              className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
              required
            />
          </label>

          <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
            Cargo logístico
            <input
              name="logisticFee"
              type="number"
              min="0"
              step="0.01"
              defaultValue={logisticFee}
              className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
              required
            />
          </label>
        </div>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Duración en minutos
          <input
            name="durationMinutes"
            type="number"
            min="1"
            defaultValue={durationMinutes}
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
            required
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Descripción
          <textarea
            name="description"
            defaultValue={description}
            className="min-h-20 rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#E60023]"
          />
        </label>

        {state.message ? (
          <p
            className={`text-xs font-bold ${
              state.success ? "text-green-700" : "text-[#E60023]"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-full bg-[#E60023] px-4 text-xs font-black text-white transition hover:bg-[#C4001D] disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </details>
  );
}