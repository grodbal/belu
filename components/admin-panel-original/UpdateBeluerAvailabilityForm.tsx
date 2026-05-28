"use client";

import { useActionState } from "react";
import { updateBeluerAvailabilityAction } from "@/app/actions/admin/updateBeluerAvailability";

const initialState = {
  success: false,
  message: "",
};

type UpdateBeluerAvailabilityFormProps = {
  beluerProfileId: string;
  isAvailable: boolean | null;
};

const availabilityOptions = [
  { value: "true", label: "Disponible" },
  { value: "false", label: "No disponible" },
];

export default function UpdateBeluerAvailabilityForm({
  beluerProfileId,
  isAvailable,
}: UpdateBeluerAvailabilityFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBeluerAvailabilityAction,
    initialState
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {availabilityOptions.map((option) => {
          const optionBoolean = option.value === "true";
          const isActive = isAvailable === optionBoolean;

          return (
            <form key={option.value} action={formAction}>
              <input
                type="hidden"
                name="beluerProfileId"
                value={beluerProfileId}
              />

              <input
                type="hidden"
                name="isAvailable"
                value={option.value}
              />

              <button
                type="submit"
                disabled={isPending || isActive}
                className={`rounded-full px-3 py-1 text-xs font-black transition ${
                  isActive
                    ? optionBoolean
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