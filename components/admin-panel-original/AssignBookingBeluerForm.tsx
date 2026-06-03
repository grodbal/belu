"use client";

import { useActionState } from "react";
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
  const [state, formAction, isPending] = useActionState(
    assignBookingBeluerAction,
    initialState
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
          defaultValue={currentBeluerProfileId || ""}
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
