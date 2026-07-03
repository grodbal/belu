"use client"

import { useState } from "react"
import { mockBookings, MockBooking } from "./mockData"
import { StatusBadge, PaymentBadge, EmptyState, SectionHeader, Drawer } from "./Shared"
import { Section } from "./Shell"

interface SectionMisCitasProps {
  onNavigate: (s: Section) => void
}

export function SectionMisCitas({ onNavigate }: SectionMisCitasProps) {
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null)

  const next = mockBookings.find((b) => b.status === "confirmed" || b.status === "in_progress")
  const history = mockBookings.filter((b) => b.status === "completed" || b.status === "cancelled")

  return (
    <div className="proto-mis-citas">
      <SectionHeader
        kicker="Mi agenda"
        title="Mis citas"
        subtitle="Tu proxima cita y el historial de tus reservas."
      />

      {/* ── Proxima cita protagonista ─────────────────────── */}
      {next ? (
        <div className="proto-next-apt proto-next-apt--standalone">
          <div className="proto-next-apt-visual">
            <span className="proto-apt-kicker">Proxima cita</span>
            <strong className="proto-apt-service">{next.service}</strong>
            <div className="proto-apt-beluer-row">
              <span className="proto-apt-avatar">{next.beluerInitials}</span>
              <span className="proto-apt-beluer-name">{next.beluer}</span>
            </div>
            <span className="proto-star-decoration">✦</span>
          </div>
          <div className="proto-next-apt-content">
            <div className="proto-next-apt-header">
              <StatusBadge status={next.status} />
            </div>
            <h2>{next.service}</h2>
            <div className="proto-apt-facts">
              <div><span>Fecha</span><strong>{next.date}</strong></div>
              <div><span>Hora</span><strong>{next.time}</strong></div>
              <div><span>Ubicacion</span><strong>{next.address}</strong></div>
              <div><span>Total</span><strong>S/ {next.price}</strong></div>
            </div>
            <div className="proto-apt-actions">
              <button className="proto-btn-primary" onClick={() => setSelectedBooking(next)}>
                Ver detalle
              </button>
              <button className="proto-btn-ghost">Reagendar</button>
              <button className="proto-btn-link">Cancelar</button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No tienes citas proximas"
          description="Agenda tu proxima sesion y te mostramos aqui cuando este confirmada."
          action={{ label: "Reservar ahora", onClick: () => onNavigate("reservar") }}
        />
      )}

      {/* ── Historial ─────────────────────────────────────── */}
      <div className="proto-history-block">
        <h2 className="proto-block-title">Historial de citas</h2>
        {history.length === 0 ? (
          <EmptyState
            title="Aun no tienes citas en el historial"
            description="Cuando completes una reserva, aparecera aqui."
            action={{ label: "Hacer mi primera reserva", onClick: () => onNavigate("reservar") }}
          />
        ) : (
          <div className="proto-history-list">
            {history.map((b) => (
              <div key={b.id} className="proto-history-card">
                <div className="proto-history-left">
                  <div className="proto-history-avatar">{b.beluerInitials}</div>
                </div>
                <div className="proto-history-info">
                  <div className="proto-history-top-row">
                    <strong>{b.service}</strong>
                    <StatusBadge status={b.status} />
                  </div>
                  <span className="proto-history-meta">
                    {b.beluer} · {b.date} · S/ {b.price}
                  </span>
                  <div className="proto-history-actions">
                    <button className="proto-btn-ghost proto-btn-ghost--sm" onClick={() => setSelectedBooking(b)}>
                      Ver detalle
                    </button>
                    {b.status === "completed" && (
                      <button
                        className="proto-btn-primary proto-btn-primary--sm"
                        onClick={() => onNavigate("reservar")}
                      >
                        Repetir servicio
                      </button>
                    )}
                  </div>
                </div>
                <div className="proto-history-right">
                  <PaymentBadge status={b.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Drawer detalle de cita ────────────────────────── */}
      <Drawer
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Detalle de cita"
      >
        {selectedBooking && (
          <div className="proto-booking-detail">
            <div className="proto-booking-detail-header">
              <StatusBadge status={selectedBooking.status} />
              {selectedBooking.isExpress && <span className="proto-express-pill">Express</span>}
            </div>
            <h3>{selectedBooking.service}</h3>

            <div className="proto-detail-facts">
              <div className="proto-detail-fact">
                <span>Beluer</span>
                <div className="proto-detail-beluer">
                  <div className="proto-avatar proto-avatar--sm">{selectedBooking.beluerInitials}</div>
                  <strong>{selectedBooking.beluer}</strong>
                </div>
              </div>
              <div className="proto-detail-fact">
                <span>Fecha</span>
                <strong>{selectedBooking.date}</strong>
              </div>
              <div className="proto-detail-fact">
                <span>Hora</span>
                <strong>{selectedBooking.time}</strong>
              </div>
              <div className="proto-detail-fact">
                <span>Ubicacion</span>
                <strong>{selectedBooking.address}</strong>
              </div>
              <div className="proto-detail-fact">
                <span>Pago</span>
                <PaymentBadge status={selectedBooking.paymentStatus} />
              </div>
              <div className="proto-detail-fact">
                <span>Total</span>
                <strong className="proto-detail-price">S/ {selectedBooking.price}</strong>
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="proto-detail-notes">
                <span>Notas</span>
                <p>{selectedBooking.notes}</p>
              </div>
            )}

            <div className="proto-detail-actions">
              {selectedBooking.status === "completed" && (
                <button
                  className="proto-btn-primary"
                  onClick={() => { setSelectedBooking(null); onNavigate("reservar") }}
                >
                  Repetir este servicio
                </button>
              )}
              {(selectedBooking.status === "confirmed" || selectedBooking.status === "pending") && (
                <>
                  <button className="proto-btn-ghost">Reagendar</button>
                  <button className="proto-btn-link">Cancelar reserva</button>
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
