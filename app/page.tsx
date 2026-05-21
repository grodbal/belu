import MainNav from "@/components/layout/MainNav";
import HeroClientas from "@/components/clientas/HeroClientas";
import ServiciosClientas from "@/components/clientas/ServiciosClientas";
import BeluersPreviewClientas from "@/components/clientas/BeluersPreviewClientas";
import SeguridadClientas from "@/components/clientas/SeguridadClientas";
import GarantiaClientas from "@/components/clientas/GarantiaClientas";
import PanelPreviewClientas from "@/components/clientas/PanelPreviewClientas";
import FaqClientas from "@/components/clientas/FaqClientas";
import CtaFinalClientas from "@/components/clientas/CtaFinalClientas";
import FooterClientas from "@/components/clientas/FooterClientas";

export default function Home() {
  return (
    <>
      <MainNav variant="clientas" />
      <HeroClientas />
      <ServiciosClientas />
      <BeluersPreviewClientas />
      <SeguridadClientas />
      <GarantiaClientas />
      <PanelPreviewClientas />
      <FaqClientas />
      <CtaFinalClientas />
      <FooterClientas />
    </>
  );
}