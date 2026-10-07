import type { ClientNavigationItem } from "@/components/belu/navigation/client-navigation.types";
import type { BeluerSection } from "@/components/beluer-panel-original/beluerPanelTypes";

export const beluerPrimaryNavigation: ClientNavigationItem<BeluerSection>[] = [
  { id: "dashboard", label: "Inicio", icon: "home" },
  { id: "reservas", label: "Reservas", icon: "calendar" },
  { id: "servicios", label: "Mis Servicios", icon: "sparkles" },
  { id: "portafolio", label: "Portafolio", icon: "heart" },
  { id: "ingresos", label: "Ingresos", icon: "card" },
  { id: "perfil", label: "Mi Perfil", icon: "user" },
];

export const beluerMobileNavigation: ClientNavigationItem<BeluerSection>[] = [
  { id: "dashboard", label: "Inicio", icon: "home" },
  { id: "reservas", label: "Reservas", icon: "calendar" },
  { id: "servicios", label: "Servicios", icon: "sparkles" },
  { id: "ingresos", label: "Ingresos", icon: "card" },
  { id: "perfil", label: "Perfil", icon: "user" },
];
