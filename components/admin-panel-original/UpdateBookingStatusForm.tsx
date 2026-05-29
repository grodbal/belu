"use client";

import { useActionState } from "react";
import { updateBookingStatusAction } from "@/app/actions/admin/updateBookingStatus";

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

type UpdateBookingStatusFormProps = {
  bookingId: string;
  currentStatus: BookingStatus;
};

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "assigned", label: "Asignada" },
  { value: "confirmed", label: "Confirmada" },
  { value: "in_progress", label: "En curso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

export default function UpdateBookingStatusForm({
  bookingId,
  currentStatus,
}: UpdateBookingStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBookingStatusAction,
    initialState
  );

  return (
    <div className="space-y-2">
      <div className="flex max-w-[260px] flex-wrap gap-2">
        {statusOptions.map((option) => {
          const isActive = currentStatus === option.value;

          return (
            <form key={option.value} action={formAction}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="status" value={option.value} />

              <button
                type="submit"
                disabled={isPending || isActive}
                className={`rounded-full px-3 py-1 text-xs font-black transition ${
                  isActive
                    ? "bg-[#E60023] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-[#FFD6E2] hover:text-[#E60023]"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {option.label}
              </button>
            </form>
          );
        })}
      </div>

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