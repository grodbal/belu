"use client";

import { useActionState } from "react";
import { updateServiceStatusAction } from "@/app/actions/admin/updateServiceStatus";

const initialState = {
  success: false,
  message: "",
};

type UpdateServiceStatusFormProps = {
  serviceId: string;
  currentStatus: "active" | "inactive";
};

const statusOptions = [
  { value: "active", label: "Activar" },
  { value: "inactive", label: "Desactivar" },
];

export default function UpdateServiceStatusForm({
  serviceId,
  currentStatus,
}: UpdateServiceStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateServiceStatusAction,
    initialState
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const isActive = currentStatus === option.value;

          return (
            <form key={option.value} action={formAction}>
              <input type="hidden" name="serviceId" value={serviceId} />
              <input type="hidden" name="status" value={option.value} />

              <button
                type="submit"
                disabled={isPending || isActive}
                className={`rounded-full px-3 py-1 text-xs font-black transition ${
                  isActive
                    ? option.value === "active"
                      ? "bg-green-600 text-white"
                      : "bg-neutral-700 text-white"
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