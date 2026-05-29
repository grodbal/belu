"use client";

import { useActionState } from "react";
import { updateBeluerServiceSkillsAction } from "@/app/actions/admin/updateBeluerServiceSkills";

const initialState = {
  success: false,
  message: "",
};

type ServiceOption = {
  id: string;
  name: string;
  category: string;
};

type UpdateBeluerServiceSkillsFormProps = {
  beluerProfileId: string;
  services: ServiceOption[];
  assignedServiceIds: string[];
};

function getCategoryLabel(category: string) {
  if (category === "lashes") return "Lashes";
  if (category === "nails") return "Nails";
  return category;
}

export default function UpdateBeluerServiceSkillsForm({
  beluerProfileId,
  services,
  assignedServiceIds,
}: UpdateBeluerServiceSkillsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBeluerServiceSkillsAction,
    initialState
  );

  return (
    <details className="rounded-2xl border border-neutral-100 bg-white p-4">
      <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
        Servicios que realiza
      </summary>

      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="beluerProfileId" value={beluerProfileId} />

        <div className="grid gap-2">
          {services.map((service) => {
            const defaultChecked = assignedServiceIds.includes(service.id);

            return (
              <label
                key={service.id}
                className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-[#F7F3F0] p-3 text-xs"
              >
                <input
                  type="checkbox"
                  name="serviceIds"
                  value={service.id}
                  defaultChecked={defaultChecked}
                  className="mt-1"
                />

                <span>
                  <strong className="block text-[#1A1A1A]">
                    {service.name}
                  </strong>

                  <span className="text-neutral-500">
                    {getCategoryLabel(service.category)}
                  </span>
                </span>
              </label>
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

        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-full bg-[#E60023] px-4 text-xs font-black text-white transition hover:bg-[#C4001D] disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar servicios"}
        </button>
      </form>
    </details>
  );
}