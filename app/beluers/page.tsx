import MainNav from "@/components/layout/MainNav";
import HeroBeluers from "@/components/beluers/HeroBeluers";
import ProblemaBeluers from "@/components/beluers/ProblemaBeluers";

export default function BeluersPage() {
  return (
    <>
      <MainNav variant="beluers" />
      <HeroBeluers />
      <ProblemaBeluers />
    </>
  );
}