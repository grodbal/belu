"use client";

import { useActionState } from "react";
import { updateBeluerLevelAction } from "@/app/actions/admin/updateBeluerLevel";

const initialState = {
  success: false,
  message: "",
};

type UpdateBeluerLevelFormProps = {
  beluerProfileId: string;
  currentLevel: string | null;
};

const levelOptions = [
  {
    value: "standard",
    label: "✦ Estándar",
    requirement: "< 50 servicios",
  },
  {
    value: "premium",
    label: "✦✦ Premium",
    requirement: "50+ servicios · rating ≥ 4.7",
  },
  {
    value: "top",
    label: "✦✦✦ Top",
    requirement: "100+ servicios · rating ≥ 4.8",
  },
];

export default function UpdateBeluerLevelForm({
  beluerProfileId,
  currentLevel,
}: UpdateBeluerLevelFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBeluerLevelAction,
    initialState
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {levelOptions.map((option) => {
          const isActive = currentLevel === option.value;

          return (
            <form key={option.value} action={formAction}>
              <input
                type="hidden"
                name="beluerProfileId"
                value={beluerProfileId}
              />

              <input type="hidden" name="level" value={option.value} />

              <button
                type="submit"
                disabled={isPending || isActive}
                title={option.requirement}
                className={`rounded-full px-3 py-1 text-xs font-black transition ${
                  isActive
                    ? "bg-[#E60023] text-white"
                    : "bg-[#FFD6E2] text-[#E60023] hover:bg-[#E60023] hover:text-white"
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