"use client";

import { useActionState } from "react";
import { createBookingAction } from "@/app/actions/client/createBooking";

const initialState = {
  success: false,
  message: "",
};

type ServiceOption = {
  id: string;
  name: string;
  category: string;
  public_price: number;
  duration_minutes: number;
};

type CreateBookingFormProps = {
  services: ServiceOption[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

function getCategoryLabel(category: string) {
  if (category === "lashes") return "Lashes";
  if (category === "nails") return "Nails";
  return category;
}

export default function CreateBookingForm({ services }: CreateBookingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createBookingAction,
    initialState
  );

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
        Servicio
        <select
          name="serviceId"
          className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
          required
        >
          <option value="">Selecciona un servicio</option>

          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {getCategoryLabel(service.category)} ·{" "}
              {formatCurrency(service.public_price)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Fecha
          <input
            name="scheduledDate"
            type="date"
            className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
          Hora
          <input
            name="scheduledTime"
            type="time"
            className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
            required
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
        Distrito
        <select
          name="district"
          className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
          required
        >
          <option value="">Selecciona distrito</option>
          <option value="Miraflores">Miraflores</option>
          <option value="San Isidro">San Isidro</option>
          <option value="Surco">Surco</option>
          <option value="La Molina">La Molina</option>
          <option value="Barranco">Barranco</option>
          <option value="San Borja">San Borja</option>
          <option value="San Miguel">San Miguel</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
        Dirección
        <input
          name="address"
          type="text"
          placeholder="Av. / Calle / Número / Referencia"
          className="h-12 rounded-[16px] border border-[#E8E0E3] bg-white px-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-[#1A1A1A]">
        Notas opcionales
        <textarea
          name="notes"
          placeholder="Ej: Tengo estacionamiento, entrar por recepción, etc."
          className="min-h-24 resize-none rounded-[16px] border border-[#E8E0E3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E60023] focus:ring-4 focus:ring-[#FFD6E2]/60"
        />
      </label>

      <label className="flex items-start gap-3 rounded-[16px] bg-[#FFD6E2]/50 p-4 text-sm font-bold text-[#1A1A1A]">
        <input
          type="checkbox"
          name="isExpress"
          value="true"
          className="mt-1"
        />

        <span>
          belu Express
          <span className="block text-xs font-medium text-neutral-500">
            Reserva urgente. Agrega S/ 20 para la Beluer que acepte el servicio.
          </span>
        </span>
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
        className="h-12 rounded-full bg-[#E60023] px-6 text-sm font-extrabold text-white transition hover:bg-[#C4001D] disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
      >
        {isPending ? "Creando reserva..." : "Crear reserva"}
      </button>
    </form>
  );
}