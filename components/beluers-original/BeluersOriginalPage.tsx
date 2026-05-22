import BeluersModalOriginal from "./BeluersModalOriginal";
import BeluersNavbarOriginal from "./BeluersNavbarOriginal";
import HeroBeluersOriginal from "./HeroBeluersOriginal";
import BeluersInteractions from "./BeluersInteractions";
import StatsBeluersOriginal from "./StatsBeluersOriginal";
import ProblemaBeluersOriginal from "./ProblemaBeluersOriginal";
import SolucionBeluersOriginal from "./SolucionBeluersOriginal";
import ImageBreakBeluersOriginal from "./ImageBreakBeluersOriginal";

export default function BeluersOriginalPage() {
  return (
    <div className="beluers-original">
      <BeluersInteractions />
      <BeluersModalOriginal />
      <BeluersNavbarOriginal />
      <HeroBeluersOriginal />
      <StatsBeluersOriginal />
      <ProblemaBeluersOriginal />
      <SolucionBeluersOriginal />
      <ImageBreakBeluersOriginal />
    </div>
  );
}