"use client"

import { useState } from "react"
import { mockClient } from "./mockData"
import { SectionHeader, Kicker } from "./Shared"

export function SectionPerfil() {
  const [name, setName] = useState(mockClient.name)
  const [email, setEmail] = useState(mockClient.email)
  const [phone, setPhone] = useState(mockClient.phone)
  const [address, setAddress] = useState(mockClient.address)
  const [notifCita, setNotifCita] = useState(true)
  const [notifRetoque, setNotifRetoque] = useState(true)
  const [notifNews, setNotifNews] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="proto-perfil">
      <SectionHeader
        kicker="Mi cuenta"
        title="Perfil"
        subtitle="Gestiona tus datos personales y preferencias."
      />

      <div className="proto-perfil-layout">
        {/* Columna izquierda: resumen */}
        <aside className="proto-perfil-aside">
          <div className="proto-perfil-avatar-block">
            <div className="proto-avatar proto-avatar--xl">{mockClient.initials}</div>
            <strong>{mockClient.name}</strong>
            <span>Clienta belu</span>
            <button className="proto-btn-ghost proto-btn-ghost--sm">Cambiar foto</button>
            <div className="proto-mock-note proto-mock-note--inline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Requiere storage de imagenes.</span>
            </div>
          </div>

          <div className="proto-perfil-stats">
            <div className="proto-stat-box">
              <strong>{mockClient.bookingCount}</strong>
              <span>Citas</span>
            </div>
            <div className="proto-stat-box">
              <strong>{mockClient.favoritesCount}</strong>
              <span>Favoritas</span>
            </div>
          </div>
        </aside>

        {/* Columna derecha: formulario */}
        <div className="proto-perfil-form-col">
          <form onSubmit={handleSave}>
            <div className="proto-form-section">
              <Kicker>Datos personales</Kicker>
              <div className="proto-form-grid">
                <div className="proto-form-field">
                  <label htmlFor="proto-name">Nombre completo</label>
                  <input
                    id="proto-name"
                    className="proto-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="proto-form-field">
                  <label htmlFor="proto-email">Correo electronico</label>
                  <input
                    id="proto-email"
                    type="email"
                    className="proto-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="proto-form-field">
                  <label htmlFor="proto-phone">Telefono</label>
                  <input
                    id="proto-phone"
                    type="tel"
                    className="proto-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="proto-form-section">
              <Kicker>Direccion frecuente</Kicker>
              <div className="proto-form-field">
                <label htmlFor="proto-address">Direccion de atencion</label>
                <input
                  id="proto-address"
                  className="proto-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="proto-form-section">
              <Kicker>Notificaciones</Kicker>
              <div className="proto-toggles">
                <label className="proto-toggle-row">
                  <div className="proto-toggle-text">
                    <strong>Recordatorio de cita</strong>
                    <p>Te avisamos 2 horas antes de tu cita.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifCita}
                    className={`proto-toggle${notifCita ? " proto-toggle--on" : ""}`}
                    onClick={() => setNotifCita((v) => !v)}
                  >
                    <span className="proto-toggle-thumb" />
                  </button>
                </label>
                <label className="proto-toggle-row">
                  <div className="proto-toggle-text">
                    <strong>Retoque dia 21</strong>
                    <p>Te recordamos cuando se acerca el momento del retoque.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifRetoque}
                    className={`proto-toggle${notifRetoque ? " proto-toggle--on" : ""}`}
                    onClick={() => setNotifRetoque((v) => !v)}
                  >
                    <span className="proto-toggle-thumb" />
                  </button>
                </label>
                <label className="proto-toggle-row">
                  <div className="proto-toggle-text">
                    <strong>Novedades belu</strong>
                    <p>Enterate de nuevos servicios y Beluers.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifNews}
                    className={`proto-toggle${notifNews ? " proto-toggle--on" : ""}`}
                    onClick={() => setNotifNews((v) => !v)}
                  >
                    <span className="proto-toggle-thumb" />
                  </button>
                </label>
              </div>
            </div>

            <div className="proto-form-section">
              <Kicker>Seguridad</Kicker>
              <button type="button" className="proto-btn-ghost proto-btn-ghost--sm">
                Cambiar contrasena
              </button>
            </div>

            <div className="proto-form-actions">
              <button type="submit" className="proto-btn-primary">
                Guardar cambios
              </button>
              {saved && <span className="proto-save-toast">Cambios guardados</span>}
            </div>
          </form>

          <div className="proto-danger-zone">
            <button className="proto-btn-danger-ghost">Cerrar sesion</button>
            <button className="proto-btn-danger-link">Eliminar cuenta</button>
          </div>
        </div>
      </div>
    </div>
  )
}
