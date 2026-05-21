import MainNav from "@/components/layout/MainNav";
import HeroBeluers from "@/components/beluers/HeroBeluers";
import ProblemaBeluers from "@/components/beluers/ProblemaBeluers";
import ComoFuncionaBeluers from "@/components/beluers/ComoFuncionaBeluers";
import BeneficiosBeluers from "@/components/beluers/BeneficiosBeluers";
import CalculadoraBeluers from "@/components/beluers/CalculadoraBeluers";

export default function BeluersPage() {
  return (
    <>
      <MainNav variant="beluers" />
      <HeroBeluers />
      <ProblemaBeluers />
      <ComoFuncionaBeluers />
      <BeneficiosBeluers />
      <CalculadoraBeluers />
    </>
  );
}