import MainNav from "@/components/layout/MainNav";
import HeroBeluers from "@/components/beluers/HeroBeluers";
import ProblemaBeluers from "@/components/beluers/ProblemaBeluers";
import ComoFuncionaBeluers from "@/components/beluers/ComoFuncionaBeluers";

export default function BeluersPage() {
  return (
    <>
      <MainNav variant="beluers" />
      <HeroBeluers />
      <ProblemaBeluers />
      <ComoFuncionaBeluers />
    </>
  );
}