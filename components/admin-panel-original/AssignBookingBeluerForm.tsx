"use client";

import { useActionState, useMemo, useState } from "react";
import { assignBookingBeluerAction } from "@/app/actions/admin/assignBookingBeluer";

const initialState = {
  success: false,
  message: "",
};

type BookingStatus =
  | "pending"
  | "assigned"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "redo_requested"
  | "redo_approved";

type BeluerOption = {
  id: string;
  public_name: string | null;
  level: string | null;
};

type AssignBookingBeluerFormProps = {
  bookingId: string;
  currentStatus: BookingStatus;
  currentBeluerProfileId: string | null;
  availableBeluers: BeluerOption[];
};

export default function AssignBookingBeluerForm({
  bookingId,
  currentStatus,
  currentBeluerProfileId,
  availableBeluers,
}: AssignBookingBeluerFormProps) {
  const [selectedBeluerId, setSelectedBeluerId] = useState(
    currentBeluerProfileId || ""
  );
  const [state, formAction, isPending] = useActionState(
    assignBookingBeluerAction,
    initialState
  );
  const selectedBeluer = useMemo(
    () => availableBeluers.find((beluer) => beluer.id === selectedBeluerId),
    [availableBeluers, selectedBeluerId]
  );
  const isBlocked =
    currentStatus === "cancelled" ||
    currentStatus === "completed" ||
    currentStatus === "confirmed" ||
    currentStatus === "in_progress";

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
        Asignar Beluer
      </p>

      <form action={formAction} className="flex max-w-[260px] flex-col gap-2">
        <input type="hidden" name="bookingId" value={bookingId} />

        <select
          name="beluerProfileId"
          value={selectedBeluerId}
          onChange={(event) => setSelectedBeluerId(event.target.value)}
          disabled={isPending || isBlocked || availableBeluers.length === 0}
          className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <option value="">Selecciona Beluer</option>
          {availableBeluers.map((beluer) => (
            <option key={beluer.id} value={beluer.id}>
              {beluer.public_name || "Beluer sin nombre público"}
            </option>
          ))}
        </select>

        {selectedBeluer ? (
          <p className="rounded-2xl bg-[#FFD6E2]/60 px-3 py-2 text-xs font-black text-[#E60023]">
            Nivel actual: {getBeluerLevelLabel(selectedBeluer.level)} · Comision
            belu: {formatCommissionRate(resolveBeluerCommissionRate(selectedBeluer.level))}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending || isBlocked || availableBeluers.length === 0}
          className="rounded-full bg-[#E60023] px-3 py-2 text-xs font-black text-white transition hover:bg-[#C4001D] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Asignando..." : "Asignar"}
        </button>
      </form>

      {availableBeluers.length === 0 ? (
        <p className="text-xs font-bold text-[#E60023]">
          No hay Beluers aprobadas y disponibles.
        </p>
      ) : null}

      {isBlocked ? (
        <p className="text-xs font-bold text-neutral-400">
          Esta reserva no puede asignarse desde este flujo.
        </p>
      ) : null}

      {state.message ? (
        <p
          className={`text-xs font-bold ${
            state.success ? "text-green-700" : "text-[#E60023]"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

function normalizeBeluerLevel(level: string | null | undefined) {
  return String(level || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getBeluerLevelLabel(level: string | null | undefined) {
  const normalizedLevel = normalizeBeluerLevel(level);

  if (["top", "beluer_top", "beluer top", "top ✦"].includes(normalizedLevel)) {
    return "Top ✦";
  }

  if (
    ["premium", "verified", "verificada", "beluer_verificada", "beluer verificada"].includes(
      normalizedLevel
    )
  ) {
    return normalizedLevel === "premium" ? "Premium" : "Verificada";
  }

  if (["new", "nueva", "beluer_nueva", "beluer nueva"].includes(normalizedLevel)) {
    return "Nueva";
  }

  if (["standard", "estandar"].includes(normalizedLevel)) {
    return "Estándar";
  }

  return level ? String(level) : "Estándar";
}

function resolveBeluerCommissionRate(level: string | null | undefined) {
  const normalizedLevel = normalizeBeluerLevel(level);

  if (["top", "beluer_top", "beluer top", "top ✦"].includes(normalizedLevel)) {
    return 0.08;
  }

  if (
    ["premium", "verified", "verificada", "beluer_verificada", "beluer verificada"].includes(
      normalizedLevel
    )
  ) {
    return 0.1;
  }

  return 0.13;
}

function formatCommissionRate(value: number) {
  return `${new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 2,
  }).format(value * 100)}%`;
}
