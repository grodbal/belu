"use client";

import { useActionState } from "react";
import { updateBeluerStatusAction } from "@/app/actions/admin/updateBeluerStatus";

const initialState = {
  success: false,
  message: "",
};

type UpdateBeluerStatusFormProps = {
  beluerProfileId: string;
  currentStatus: string | null;
};

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobar" },
  { value: "paused", label: "Pausar" },
  { value: "rejected", label: "Rechazar" },
];

export default function UpdateBeluerStatusForm({
  beluerProfileId,
  currentStatus,
}: UpdateBeluerStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBeluerStatusAction,
    initialState
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const isActive = currentStatus === option.value;

          return (
            <form key={option.value} action={formAction}>
              <input
                type="hidden"
                name="beluerProfileId"
                value={beluerProfileId}
              />

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