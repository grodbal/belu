"use client"

import { useState } from "react"
import { ProtoShell, Section } from "../../components/prototipo/Shell"
import { SectionInicio } from "../../components/prototipo/SectionInicio"
import { SectionReservar } from "../../components/prototipo/SectionReservar"
import { SectionMisCitas } from "../../components/prototipo/SectionMisCitas"
import { SectionServicios } from "../../components/prototipo/SectionServicios"
import { SectionBeluers } from "../../components/prototipo/SectionBeluers"
import { SectionFavoritas } from "../../components/prototipo/SectionFavoritas"
import { SectionPagos } from "../../components/prototipo/SectionPagos"
import { SectionPerfil } from "../../components/prototipo/SectionPerfil"
import { SectionAyuda } from "../../components/prototipo/SectionAyuda"
import "../../app/prototipo/prototipo.css"

export default function PrototypePage() {
  const [activeSection, setActiveSection] = useState<Section>("inicio")

  return (
    <ProtoShell activeSection={activeSection} onNavigate={setActiveSection}>
      {activeSection === "inicio" && <SectionInicio onNavigate={setActiveSection} />}
      {activeSection === "reservar" && <SectionReservar onNavigate={setActiveSection} />}
      {activeSection === "mis-citas" && <SectionMisCitas onNavigate={setActiveSection} />}
      {activeSection === "servicios" && <SectionServicios onNavigate={setActiveSection} />}
      {activeSection === "beluers" && <SectionBeluers onNavigate={setActiveSection} />}
      {activeSection === "favoritas" && <SectionFavoritas onNavigate={setActiveSection} />}
      {activeSection === "pagos" && <SectionPagos />}
      {activeSection === "perfil" && <SectionPerfil />}
      {activeSection === "ayuda" && <SectionAyuda />}
    </ProtoShell>
  )
}
