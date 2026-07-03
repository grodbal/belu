"use client"

import { useState } from "react"
import { mockServices, mockBeluers, mockClient, MockService, MockBeluer } from "./mockData"
import { Kicker, FilterPills, Avatar, Modal } from "./Shared"
import { Section } from "./Shell"

interface SectionReservarProps {
  onNavigate: (s: Section) => void
}

type Step = 1 | 2 | 3 | 4
type CategoryFilter = "Todos" | "Lashes" | "Nails"

const MOCK_DATES = [
  { label: "Lun 7 Jul", available: true },
  { label: "Mar 8 Jul", available: true },
  { label: "Mie 9 Jul", available: false },
  { label: "Jue 10 Jul", available: true },
  { label: "Vie 11 Jul", available: true },
  { label: "Sab 12 Jul", available: true },
  { label: "Dom 13 Jul", available: false },
]

const MOCK_TIMES = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

export function SectionReservar({ onNavigate }: SectionReservarProps) {
  const [step, setStep] = useState<Step>(1)
  const [selectedService, setSelectedService] = useState<MockService | null>(null)
  const [selectedBeluer, setSelectedBeluer] = useState<MockBeluer | null>(null)
  const [noPreference, setNoPreference] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [filterCat, setFilterCat] = useState<CategoryFilter>("Todos")
  const [confirmed, setConfirmed] = useState(false)

  const filteredServices =
    filterCat === "Todos" ? mockServices : mockServices.filter((s) => s.category === filterCat)

  const availableBeluers = selectedService
    ? mockBeluers.filter((b) => b.available && b.specialties.some((s) => s === selectedService.category || s === "Lashes" || s === "Nails"))
    : mockBeluers.filter((b) => b.available)

  const beluerDisplay = noPreference ? "Sin preferencia (asignacion automatica)" : selectedBeluer?.name ?? ""

  function handleConfirm() {
    setConfirmed(true)
  }

  function handleReset() {
    setStep(1)
    setSelectedService(null)
    setSelectedBeluer(null)
    setNoPreference(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setNotes("")
    setConfirmed(false)
  }

  const steps = [
    { n: 1, label: "Servicio" },
    { n: 2, label: "Beluer" },
    { n: 3, label: "Fecha y hora" },
    { n: 4, label: "Confirmar" },
  ]

  return (
    <div className="proto-reservar">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="proto-reservar-header">
        <Kicker>Nueva reserva</Kicker>
        <h1 className="proto-section-title">Tu proximo momento belu</h1>
        <p className="proto-section-subtitle">Elige tu servicio, tu Beluer y el horario que prefieras.</p>
      </div>

      {/* ── Stepper ──────────────────────────────────────── */}
      <div className="proto-stepper">
        {steps.map((s, i) => (
          <div key={s.n} className="proto-stepper-item">
            <div className={`proto-step-circle${step === s.n ? " proto-step-circle--active" : step > s.n ? " proto-step-circle--done" : ""}`}>
              {step > s.n ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : s.n}
            </div>
            <span className={`proto-step-label${step === s.n ? " proto-step-label--active" : ""}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`proto-step-line${step > s.n ? " proto-step-line--done" : ""}`} />}
          </div>
        ))}
      </div>

      {/* ── Layout two-col desktop ───────────────────────── */}
      <div className="proto-reservar-body">
        {/* Columna principal */}
        <div className="proto-reservar-main">
          {/* PASO 1: Elegir servicio */}
          {step === 1 && (
            <div className="proto-step-content">
              <h2 className="proto-step-title">Elige tu servicio</h2>
              <FilterPills<CategoryFilter>
                options={[
                  { value: "Todos", label: "Todos" },
                  { value: "Lashes", label: "Lashes" },
                  { value: "Nails", label: "Nails" },
                ]}
                active={filterCat}
                onChange={setFilterCat}
              />
              <div className="proto-book-service-grid">
                {filteredServices.map((svc) => (
                  <button
                    key={svc.id}
                    className={`proto-book-service-card${selectedService?.id === svc.id ? " proto-book-service-card--selected" : ""}`}
                    onClick={() => {
                      setSelectedService(svc)
                      setSelectedBeluer(null)
                      setNoPreference(false)
                    }}
                  >
                    <span className="proto-book-service-chip">{svc.tag}</span>
                    <div className="proto-book-service-info">
                      <strong>{svc.name}</strong>
                      <small>S/ {svc.priceFrom} · {svc.duration}</small>
                      <em>{svc.shortDescription}</em>
                    </div>
                    {selectedService?.id === svc.id && (
                      <span className="proto-book-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="proto-step-actions">
                <button
                  className="proto-btn-primary"
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Elegir Beluer */}
          {step === 2 && (
            <div className="proto-step-content">
              <h2 className="proto-step-title">Elige tu Beluer</h2>
              <div className="proto-mock-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>En produccion: validar si el flujo actual permite elegir Beluer o si se mantiene asignacion automatica por Admin.</span>
              </div>

              {/* Opcion: sin preferencia */}
              <button
                className={`proto-no-pref-btn${noPreference ? " proto-no-pref-btn--selected" : ""}`}
                onClick={() => { setNoPreference(true); setSelectedBeluer(null) }}
              >
                <span className="proto-no-pref-icon">✦</span>
                <div>
                  <strong>Sin preferencia</strong>
                  <p>belu asigna automaticamente la mejor Beluer disponible para tu servicio y zona.</p>
                </div>
                {noPreference && (
                  <span className="proto-book-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>

              <p className="proto-or-label">O elige una Beluer</p>

              <div className="proto-beluer-list">
                {availableBeluers.map((b) => (
                  <button
                    key={b.id}
                    className={`proto-beluer-card${selectedBeluer?.id === b.id ? " proto-beluer-card--selected" : ""}`}
                    onClick={() => { setSelectedBeluer(b); setNoPreference(false) }}
                  >
                    <Avatar initials={b.initials} size="md" />
                    <div className="proto-beluer-info">
                      <div className="proto-beluer-name-row">
                        <strong>{b.name}</strong>
                        {b.attended && <span className="proto-attended-chip">Ya te atendio</span>}
                      </div>
                      <span className="proto-beluer-rating">★ {b.rating} ({b.reviewCount} resenas)</span>
                      <div className="proto-beluer-tags">
                        {b.specialties.map((s) => (
                          <span key={s} className="proto-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                    {selectedBeluer?.id === b.id && (
                      <span className="proto-book-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="proto-step-actions">
                <button className="proto-btn-ghost" onClick={() => setStep(1)}>Atras</button>
                <button
                  className="proto-btn-primary"
                  disabled={!selectedBeluer && !noPreference}
                  onClick={() => setStep(3)}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Fecha y hora */}
          {step === 3 && (
            <div className="proto-step-content">
              <h2 className="proto-step-title">Elige fecha y hora</h2>

              <div className="proto-calendar-dates">
                {MOCK_DATES.map((d) => (
                  <button
                    key={d.label}
                    className={`proto-date-btn${!d.available ? " proto-date-btn--disabled" : ""}${selectedDate === d.label ? " proto-date-btn--selected" : ""}`}
                    disabled={!d.available}
                    onClick={() => setSelectedDate(d.label)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {selectedDate && (
                <>
                  <h3 className="proto-time-label">Horarios disponibles para {selectedDate}</h3>
                  <div className="proto-time-grid">
                    {MOCK_TIMES.map((t) => (
                      <button
                        key={t}
                        className={`proto-time-btn${selectedTime === t ? " proto-time-btn--selected" : ""}`}
                        onClick={() => setSelectedTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="proto-address-block">
                <label className="proto-field-label">Direccion de atencion</label>
                <div className="proto-address-value">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{mockClient.address}</span>
                  <button className="proto-link-btn">Cambiar</button>
                </div>
              </div>

              <div className="proto-step-actions">
                <button className="proto-btn-ghost" onClick={() => setStep(2)}>Atras</button>
                <button
                  className="proto-btn-primary"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(4)}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: Resumen y confirmar */}
          {step === 4 && (
            <div className="proto-step-content">
              <h2 className="proto-step-title">Resumen de tu reserva</h2>

              <div className="proto-summary-card">
                <div className="proto-summary-row">
                  <span>Servicio</span>
                  <strong>{selectedService?.name}</strong>
                </div>
                <div className="proto-summary-row">
                  <span>Beluer</span>
                  <strong>{beluerDisplay}</strong>
                </div>
                <div className="proto-summary-row">
                  <span>Fecha</span>
                  <strong>{selectedDate}</strong>
                </div>
                <div className="proto-summary-row">
                  <span>Hora</span>
                  <strong>{selectedTime}</strong>
                </div>
                <div className="proto-summary-row">
                  <span>Ubicacion</span>
                  <strong>{mockClient.address}</strong>
                </div>
                <div className="proto-summary-divider" />
                <div className="proto-summary-row proto-summary-total">
                  <span>Total</span>
                  <strong>S/ {selectedService?.priceFrom}</strong>
                </div>
              </div>

              <div className="proto-notes-block">
                <label className="proto-field-label">Notas para tu Beluer (opcional)</label>
                <textarea
                  className="proto-textarea"
                  placeholder="Ej: Prefiero estilo natural, tengo alergias a..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="proto-mock-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Pago: en produccion se integraria aqui la pasarela de pago real. Por ahora es demo visual.</span>
              </div>

              <div className="proto-step-actions">
                <button className="proto-btn-ghost" onClick={() => setStep(3)}>Atras</button>
                <button className="proto-btn-primary" onClick={handleConfirm}>
                  Confirmar reserva
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Columna resumen sticky (desktop) */}
        {step > 1 && (
          <aside className="proto-reservar-summary">
            <Kicker>Tu reserva</Kicker>
            <div className="proto-reservar-summary-content">
              {selectedService && (
                <div className="proto-summary-mini-row">
                  <span className="proto-summary-mini-label">Servicio</span>
                  <span className="proto-summary-mini-val">{selectedService.name}</span>
                </div>
              )}
              {(selectedBeluer || noPreference) && (
                <div className="proto-summary-mini-row">
                  <span className="proto-summary-mini-label">Beluer</span>
                  <span className="proto-summary-mini-val">{beluerDisplay}</span>
                </div>
              )}
              {selectedDate && (
                <div className="proto-summary-mini-row">
                  <span className="proto-summary-mini-label">Fecha</span>
                  <span className="proto-summary-mini-val">{selectedDate}</span>
                </div>
              )}
              {selectedTime && (
                <div className="proto-summary-mini-row">
                  <span className="proto-summary-mini-label">Hora</span>
                  <span className="proto-summary-mini-val">{selectedTime}</span>
                </div>
              )}
              {selectedService && (
                <>
                  <div className="proto-summary-divider" />
                  <div className="proto-summary-mini-row proto-summary-total">
                    <span>Desde</span>
                    <strong>S/ {selectedService.priceFrom}</strong>
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── Modal de confirmacion ────────────────────────── */}
      <Modal open={confirmed} onClose={() => { handleReset(); onNavigate("mis-citas") }}>
        <div className="proto-confirm-modal">
          <div className="proto-confirm-star">✦</div>
          <h2>Reserva confirmada</h2>
          <p>Tu cita de <strong>{selectedService?.name}</strong> ha sido registrada. Te notificaremos cuando tu Beluer confirme la visita.</p>
          <div className="proto-confirm-detail">
            <span>{selectedDate} a las {selectedTime}</span>
          </div>
          <button className="proto-btn-primary" onClick={() => { handleReset(); onNavigate("mis-citas") }}>
            Ver mi cita
          </button>
          <button className="proto-btn-ghost" onClick={() => { handleReset(); onNavigate("inicio") }}>
            Volver al inicio
          </button>
        </div>
      </Modal>
    </div>
  )
}
