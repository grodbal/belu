import MainNav from "@/components/layout/MainNav";
import HeroClientas from "@/components/clientas/HeroClientas";
import ServiciosClientas from "@/components/clientas/ServiciosClientas";

export default function Home() {
  return (
    <>
      <MainNav variant="clientas" />
      <HeroClientas />
      <ServiciosClientas />
    </>
  );
}