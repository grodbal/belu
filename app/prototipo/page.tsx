'use client';

import { useState } from 'react';
import { Shell } from '@/components/prototipo/Shell';
import { SectionInicio } from '@/components/prototipo/SectionInicio';
import '../prototipo/prototipo.css';
import { mockClientData } from '@/components/prototipo/mockData';

export default function PrototipoPage() {
  const [currentSection, setCurrentSection] = useState('inicio');

  const renderSection = () => {
    switch (currentSection) {
      case 'inicio':
        return <SectionInicio />;
      case 'reservar':
        return <div className="proto-section"><h2>Sección: Reservar</h2><p>Flujo de 4 pasos para nueva reserva.</p></div>;
      case 'mis-citas':
        return <div className="proto-section"><h2>Sección: Mis Citas</h2><p>Próxima cita y historial.</p></div>;
      case 'servicios':
        return <div className="proto-section"><h2>Sección: Servicios</h2><p>Grid de servicios disponibles.</p></div>;
      case 'beluers':
        return <div className="proto-section"><h2>Sección: Beluers</h2><p>Listado de especialistas.</p></div>;
      case 'favoritas':
        return <div className="proto-section"><h2>Sección: Favoritas</h2><p>Tus Beluers favoritas.</p></div>;
      case 'pagos':
        return <div className="proto-section"><h2>Sección: Pagos</h2><p>Historial de pagos.</p></div>;
      case 'perfil':
        return <div className="proto-section"><h2>Sección: Perfil</h2><p>Datos personales y preferencias.</p></div>;
      case 'ayuda':
        return <div className="proto-section"><h2>Sección: Ayuda</h2><p>FAQ y soporte.</p></div>;
      default:
        return <SectionInicio />;
    }
  };

  return (
    <Shell
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      userInitials={mockClientData.profileInitials}
    >
      {renderSection()}
    </Shell>
  );
}
