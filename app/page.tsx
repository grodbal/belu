import MainNav from "@/components/layout/MainNav";
import HeroClientas from "@/components/clientas/HeroClientas";
import ServiciosClientas from "@/components/clientas/ServiciosClientas";
import BeluersPreviewClientas from "@/components/clientas/BeluersPreviewClientas";
import SeguridadClientas from "@/components/clientas/SeguridadClientas";
import GarantiaClientas from "@/components/clientas/GarantiaClientas";

export default function Home() {
  return (
    <>
      <MainNav variant="clientas" />
      <HeroClientas />
      <ServiciosClientas />
      <BeluersPreviewClientas />
      <SeguridadClientas />
      <GarantiaClientas />
    </>
  );
}