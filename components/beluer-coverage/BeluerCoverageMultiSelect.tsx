"use client";

import { useState } from "react";
import {
  BELUER_COVERAGE_DISTRICTS,
  getCanonicalBeluerCoverageDistrict,
} from "@/lib/bookings/foundation";

type BeluerCoverageMultiSelectProps = {
  defaultValue?: string[];
  compact?: boolean;
};

export default function BeluerCoverageMultiSelect({
  defaultValue = [],
  compact = false,
}: BeluerCoverageMultiSelectProps) {
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
    () =>
      defaultValue
        .map(getCanonicalBeluerCoverageDistrict)
        .filter(Boolean) as string[]
  );

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((current) =>
      current.includes(district)
        ? current.filter((item) => item !== district)
        : [...current, district]
    );
  };

  return (
    <fieldset className="grid gap-2">
      <legend
        className={
          compact
            ? "text-xs font-bold text-[#1A1A1A]"
            : "text-sm font-bold text-[#1A1A1A]"
        }
      >
        Distritos de atención
      </legend>
      <p className="text-xs font-medium text-neutral-500">
        Selecciona al menos una zona donde la Beluer acepta reservas.
      </p>
      <div
        className={`grid max-h-56 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 ${
          compact ? "grid-cols-1 gap-2" : "gap-2 sm:grid-cols-2 md:grid-cols-3"
        }`}
      >
        {BELUER_COVERAGE_DISTRICTS.map((district) => (
          <label
            className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-bold text-[#1A1A1A] hover:bg-[#FFD6E2]/40"
            key={district}
          >
            <input
              type="checkbox"
              name="districts"
              value={district}
              checked={selectedDistricts.includes(district)}
              onChange={() => toggleDistrict(district)}
              className="h-4 w-4 accent-[#E60023]"
            />
            <span>{district}</span>
          </label>
        ))}
      </div>
      <small className="text-xs font-bold text-neutral-500">
        {selectedDistricts.length} seleccionados
      </small>
    </fieldset>
  );
}
