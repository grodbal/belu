"use client";

import { useState } from "react";
import {
  setBeluerCategoryApproval,
  type CategoryApprovalStatus,
} from "@/app/actions/admin/setBeluerCategoryApproval";

const categories = [
  { key: "lashes", label: "Pestañas" },
  { key: "brows", label: "Cejas" },
  { key: "nails", label: "Uñas" },
] as const;

type Props = {
  beluerProfileId: string;
  approvals: Partial<Record<(typeof categories)[number]["key"], CategoryApprovalStatus>>;
};

export default function AdminBeluerCategoryApprovals({ beluerProfileId, approvals }: Props) {
  const [statuses, setStatuses] = useState(approvals);
  const [busyCategory, setBusyCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const update = async (category: (typeof categories)[number]["key"], approved: boolean) => {
    const nextStatus: CategoryApprovalStatus = approved ? "approved" : "revoked";
    setBusyCategory(category);
    setMessage("");
    const result = await setBeluerCategoryApproval({ beluerProfileId, category, status: nextStatus }).catch(() => null);
    setBusyCategory(null);
    if (!result) {
      setMessage("No se pudo conectar. Vuelve a intentar.");
      return;
    }
    if (!result.ok) {
      setMessage("No se pudo actualizar la categoría. Revisa tu sesión y vuelve a intentar.");
      return;
    }
    setStatuses((current) => ({ ...current, [category]: result.data.status }));
    setMessage(`${categories.find((item) => item.key === category)?.label}: ${approved ? "habilitada" : "deshabilitada"}.`);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-nowrap gap-1.5">
        {categories.map((category) => {
          const checked = statuses[category.key] === "approved";
          return (
            <label key={category.key} className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-2 text-xs font-bold ${checked ? "border-[#E60023]/20 bg-[#FFD6E2] text-[#9d1732]" : "border-neutral-200 bg-white text-neutral-600"}`}>
              <input
                type="checkbox"
                checked={checked}
                disabled={busyCategory !== null}
                onChange={(event) => void update(category.key, event.target.checked)}
                className="h-4 w-4 accent-[#E60023] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
                aria-label={`${checked ? "Deshabilitar" : "Habilitar"} categoría ${category.label}`}
              />
              {category.label}
            </label>
          );
        })}
      </div>
      {message ? <p role="status" className="text-xs font-semibold text-neutral-600">{message}</p> : null}
      {busyCategory ? <p className="text-xs text-neutral-500">Guardando categoría…</p> : null}
    </div>
  );
}
