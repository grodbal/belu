const BELUER_COVERAGE_DISTRICT_VALUES = [
  "Ancón",
  "Ate",
  "Barranco",
  "Bellavista",
  "Breña",
  "Callao",
  "Carabayllo",
  "Carmen de la Legua-Reynoso",
  "Cercado de Lima",
  "Chaclacayo",
  "Chorrillos",
  "Cieneguilla",
  "Comas",
  "El Agustino",
  "Independencia",
  "Jesús María",
  "La Molina",
  "La Perla",
  "La Punta",
  "La Victoria",
  "Lince",
  "Los Olivos",
  "Lurigancho-Chosica",
  "Lurín",
  "Magdalena",
  "Mi Perú",
  "Miraflores",
  "Pachacámac",
  "Pucusana",
  "Pueblo Libre",
  "Puente Piedra",
  "Punta Hermosa",
  "Punta Negra",
  "Rímac",
  "San Bartolo",
  "San Borja",
  "San Isidro",
  "San Juan de Lurigancho",
  "San Juan de Miraflores",
  "San Luis",
  "San Martín de Porres",
  "San Miguel",
  "Santa Anita",
  "Santa María del Mar",
  "Santa Rosa",
  "Surco",
  "Surquillo",
  "Ventanilla",
  "Villa El Salvador",
  "Villa María del Triunfo",
] as const;

function compareBeluerCoverageDistricts(first: string, second: string) {
  const normalizedFirst = normalizeBookingDistrict(first);
  const normalizedSecond = normalizeBookingDistrict(second);

  if (normalizedFirst < normalizedSecond) return -1;
  if (normalizedFirst > normalizedSecond) return 1;
  return first.localeCompare(second, "es-PE");
}

export const BELUER_COVERAGE_DISTRICTS = Object.freeze(
  [...BELUER_COVERAGE_DISTRICT_VALUES].sort(compareBeluerCoverageDistricts)
);

export function normalizeBookingDistrict(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function getCanonicalBeluerCoverageDistrict(value: string) {
  const normalizedValue = normalizeBookingDistrict(value);

  return (
    BELUER_COVERAGE_DISTRICTS.find(
      (district) => normalizeBookingDistrict(district) === normalizedValue
    ) || null
  );
}

export function parseBeluerCoverageDistricts(values: FormDataEntryValue[]) {
  const parsedValues = values
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const invalidDistricts = parsedValues.filter(
    (value) => !getCanonicalBeluerCoverageDistrict(value)
  );
  const canonicalDistricts = parsedValues.map(
    getCanonicalBeluerCoverageDistrict
  );
  const districts = Array.from(
    new Set(
      canonicalDistricts.filter(
        (
          value
        ): value is (typeof BELUER_COVERAGE_DISTRICTS)[number] =>
          value !== null
      )
    )
  ).sort(compareBeluerCoverageDistricts);

  return { districts, invalidDistricts };
}
