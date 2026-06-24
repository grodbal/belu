"use client";

import { useActionState } from "react";
import { updateServiceAction } from "@/app/actions/admin/updateService";
import { updateServiceMainImageAction } from "@/app/actions/admin/updateServiceMainImage";

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
  imageUrl: string | null;
};

export default function EditServiceForm({
  serviceId,
  category,
  name,
  description,
  publicPrice,
  logisticFee,
  durationMinutes,
  imageUrl,
}: EditServiceFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateServiceAction,
    initialState
  );
  const [imageState, imageFormAction, imagePending] = useActionState(
    updateServiceMainImageAction,
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

      <div className="mt-5 border-t border-neutral-100 pt-4">
        <div className="mb-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
            Foto principal
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Esta foto aparece como miniatura principal del servicio. La galeria
            sigue siendo solo para fotos adicionales.
          </p>
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="mb-3 h-28 w-full rounded-2xl object-cover ring-1 ring-black/5"
          />
        ) : (
          <div className="mb-3 flex h-24 items-center justify-center rounded-2xl bg-[#FFF7F9] text-xs font-black text-[#E60023] ring-1 ring-[#FFD6E2]">
            Sin foto principal
          </div>
        )}

        <form action={imageFormAction} className="grid gap-3">
          <input type="hidden" name="serviceId" value={serviceId} />

          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs file:mr-2 file:rounded-full file:border-0 file:bg-[#FFD6E2] file:px-3 file:py-1 file:text-[10px] file:font-black file:text-[#E60023]"
            required
          />

          {imageState.message ? (
            <p
              className={`text-xs font-bold ${
                imageState.success ? "text-green-700" : "text-[#E60023]"
              }`}
            >
              {imageState.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={imagePending}
            className="h-10 rounded-full bg-[#E60023] px-4 text-xs font-black text-white transition hover:bg-[#C4001D] disabled:opacity-60"
          >
            {imagePending ? "Actualizando..." : "Actualizar foto principal"}
          </button>
        </form>
      </div>
    </details>
  );
}
