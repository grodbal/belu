import AuthModalClientas from "./AuthModalClientas";
import NavbarClientasOriginal from "./NavbarClientasOriginal";
import HeroClientasOriginal from "./HeroClientasOriginal";
import EspecialidadesClientasOriginal from "./EspecialidadesClientasOriginal";
import ClientasInteractions from "./ClientasInteractions";
import CatalogoServiciosClientasOriginal from "./CatalogoServiciosClientasOriginal";
import ModosReservaClientasOriginal from "./ModosReservaClientasOriginal";
import BeluersClientasOriginal from "./BeluersClientasOriginal";
import SeguridadClientasOriginal from "./SeguridadClientasOriginal";
import GarantiaClientasOriginal from "./GarantiaClientasOriginal";
import TestimoniosClientasOriginal from "./TestimoniosClientasOriginal";
import CoberturaClientasOriginal from "./CoberturaClientasOriginal";
import PlataformaClientasOriginal from "./PlataformaClientasOriginal";
import FaqClientasOriginal from "./FaqClientasOriginal";
import CtaFooterClientasOriginal from "./CtaFooterClientasOriginal";

export default function ClientasOriginalPage() {
  return (
    <>
      <div className="noise-overlay"></div>
      <div id="cDot"></div>
      <div id="cRing"></div>

      <ClientasInteractions />
      <AuthModalClientas />
      <NavbarClientasOriginal />
      <HeroClientasOriginal />
      <EspecialidadesClientasOriginal />
      <CatalogoServiciosClientasOriginal />
      <ModosReservaClientasOriginal />
      <BeluersClientasOriginal />
      <SeguridadClientasOriginal />
      <GarantiaClientasOriginal />
      <TestimoniosClientasOriginal />
      <CoberturaClientasOriginal />
      <PlataformaClientasOriginal />
      <FaqClientasOriginal />
      <CtaFooterClientasOriginal />
    </>
  );
}