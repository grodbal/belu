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
}: UpdateBookingPaymentStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBookingPaymentStatusAction,
    initialState
  );

  return (
    <div className="space-y-2">
      <div className="flex max-w-[260px] flex-wrap gap-2">
        {paymentStatusOptions.map((option) => {
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