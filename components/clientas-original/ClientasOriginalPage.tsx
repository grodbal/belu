import AuthModalClientas from "./AuthModalClientas";
import NavbarClientasOriginal from "./NavbarClientasOriginal";
import HeroClientasOriginal from "./HeroClientasOriginal";
import EspecialidadesClientasOriginal from "./EspecialidadesClientasOriginal";
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
import ClientasInteractions from "./ClientasInteractions";

export default function ClientasOriginalPage() {
  return (
    <div className="clientas-original">
      <div className="noise-overlay"></div>

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
    </div>
  );
}