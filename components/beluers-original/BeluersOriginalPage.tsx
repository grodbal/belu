import BeluersModalOriginal from "./BeluersModalOriginal";
import BeluersNavbarOriginal from "./BeluersNavbarOriginal";
import HeroBeluersOriginal from "./HeroBeluersOriginal";
import BeluersInteractions from "./BeluersInteractions";

export default function BeluersOriginalPage() {
  return (
    <div className="beluers-original">
      <BeluersInteractions />
      <BeluersModalOriginal />
      <BeluersNavbarOriginal />
      <HeroBeluersOriginal />
    </div>
  );
}