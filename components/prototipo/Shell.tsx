'use client';

import React, { useState } from 'react';

interface ShellProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  userInitials: string;
  children: React.ReactNode;
}

export function Shell({ currentSection, onSectionChange, userInitials, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    { id: 'reservar', label: 'Reservar', icon: '✦', highlight: true },
    { id: 'mis-citas', label: 'Mis Citas', icon: '📅' },
    { id: 'servicios', label: 'Servicios', icon: '💅' },
    { id: 'beluers', label: 'Beluers', icon: '👩' },
    { id: 'favoritas', label: 'Favoritas', icon: '❤️' },
    { id: 'pagos', label: 'Pagos', icon: '💳' },
    { id: 'perfil', label: 'Perfil', icon: '👤' },
    { id: 'ayuda', label: 'Ayuda', icon: '?' },
  ];

  return (
    <div className="proto-shell">
      {/* Sidebar */}
      <aside className={`proto-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="proto-sidebar-header">
          <div className="proto-logo">
            belu <span className="proto-logo-star">✦</span>
          </div>
          <button
            className="proto-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar sidebar"
          >
            ×
          </button>
        </div>

        <nav className="proto-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`proto-nav-item ${item.highlight ? 'highlight' : ''} ${
                currentSection === item.id ? 'active' : ''
              }`}
              onClick={() => {
                onSectionChange(item.id);
                setSidebarOpen(false);
              }}
            >
              <span className="proto-nav-icon">{item.icon}</span>
              <span className="proto-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="proto-sidebar-footer">
          <div className="proto-user-pill">
            <div className="proto-avatar">{userInitials}</div>
            <span>Mi Perfil</span>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="proto-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <main className="proto-main">
        <button
          className="proto-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        {children}
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="proto-bottom-nav">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            className={`proto-bottom-nav-item ${item.highlight ? 'highlight' : ''} ${
              currentSection === item.id ? 'active' : ''
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="proto-nav-icon">{item.icon}</span>
            <span className="proto-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
