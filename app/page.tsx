import MainNav from "@/components/layout/MainNav";
import HeroClientas from "@/components/clientas/HeroClientas";
import ServiciosClientas from "@/components/clientas/ServiciosClientas";
import BeluersPreviewClientas from "@/components/clientas/BeluersPreviewClientas";

export default function Home() {
  return (
    <>
      <MainNav variant="clientas" />
      <HeroClientas />
      <ServiciosClientas />
      <BeluersPreviewClientas />
    </>
  );
}