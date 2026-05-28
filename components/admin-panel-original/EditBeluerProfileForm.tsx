"use client";

import { useActionState } from "react";
import { updateBeluerProfileAction } from "@/app/actions/admin/updateBeluerProfile";

const initialState = {
  success: false,
  message: "",
};

type EditBeluerProfileFormProps = {
  profileId: string;
  beluerProfileId: string;
  fullName: string;
  publicName: string;
  phone: string;
  instagram: string;
  districts: string;
  experienceYears: number;
  bio: string;
};

export default function EditBeluerProfileForm({
  profileId,
  beluerProfileId,
  fullName,
  publicName,
  phone,
  instagram,
  districts,
  experienceYears,
  bio,
}: EditBeluerProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBeluerProfileAction,
    initialState
  );

  return (
    <details className="rounded-2xl border border-neutral-100 bg-white p-4">
      <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
        Editar perfil
      </summary>

      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="profileId" value={profileId} />
        <input type="hidden" name="beluerProfileId" value={beluerProfileId} />

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Nombre completo
          <input
            name="fullName"
            defaultValue={fullName}
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
            required
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Nombre público
          <input
            name="publicName"
            defaultValue={publicName}
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Teléfono
          <input
            name="phone"
            defaultValue={phone}
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Instagram
          <input
            name="instagram"
            defaultValue={instagram}
            placeholder="@usuario"
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Distritos
          <input
            name="districts"
            defaultValue={districts}
            placeholder="Miraflores, San Isidro, Surco"
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Años de experiencia
          <input
            name="experienceYears"
            type="number"
            min="0"
            defaultValue={experienceYears}
            className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-[#E60023]"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[#1A1A1A]">
          Bio
          <textarea
            name="bio"
            defaultValue={bio}
            className="min-h-20 rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#E60023]"
          />
        </label>

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
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </details>
  );
}