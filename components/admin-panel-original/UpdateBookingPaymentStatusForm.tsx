"use client";

import { useActionState } from "react";
import { updateBookingPaymentStatusAction } from "@/app/actions/admin/updateBookingPaymentStatus";

const initialState = {
  success: false,
  message: "",
};

type BookingPaymentStatus = "pending" | "paid" | "failed" | "refunded";

type UpdateBookingPaymentStatusFormProps = {
  bookingId: string;
  currentPaymentStatus: BookingPaymentStatus;
  bookingStatus: string;
  allowManualUpdate: boolean;
};

const paymentStatusOptions: {
  value: BookingPaymentStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "failed", label: "Fallido" },
  { value: "refunded", label: "Reembolsado" },
];

export default function UpdateBookingPaymentStatusForm({
  bookingId,
  currentPaymentStatus,
  bookingStatus,
  allowManualUpdate,
}: UpdateBookingPaymentStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBookingPaymentStatusAction,
    initialState
  );

  if (!allowManualUpdate) {
    return (
      <p className="text-xs text-neutral-500">
        El estado de pago se actualiza mediante el intento registrado con el proveedor.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex max-w-[260px] flex-wrap gap-2">
        {paymentStatusOptions.filter((option) =>
          bookingStatus !== "payment_pending" || option.value !== "paid"
        ).map((option) => {
          const isActive = currentPaymentStatus === option.value;

          return (
            <form key={option.value} action={formAction}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input
                type="hidden"
                name="paymentStatus"
                value={option.value}
              />

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

      {bookingStatus === "payment_pending" ? (
        <p className="text-xs text-neutral-500">
          El pago se confirmará automáticamente mediante la pasarela.
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
