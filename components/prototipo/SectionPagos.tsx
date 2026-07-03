"use client"

import { useState } from "react"
import { mockPayments, MockPayment } from "./mockData"
import { SectionHeader, PaymentBadge, EmptyState, Modal } from "./Shared"

export function SectionPagos() {
  const [selectedPayment, setSelectedPayment] = useState<MockPayment | null>(null)

  const refundPending = mockPayments.some((p) => p.status === "refunded")

  return (
    <div className="proto-pagos">
      <SectionHeader
        kicker="Mis pagos"
        title="Pagos"
        subtitle="Registro de tus transacciones con belu."
      />

      {refundPending && (
        <div className="proto-refund-alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Tienes un <strong>reembolso procesado</strong> en tu historial.</span>
        </div>
      )}

      {mockPayments.length === 0 ? (
        <EmptyState
          title="Aun no tienes pagos registrados"
          description="Cuando completes tu primera reserva, tus pagos apareceran aqui."
        />
      ) : (
        <div className="proto-pagos-list">
          {mockPayments.map((p) => (
            <button
              key={p.id}
              className="proto-payment-row"
              onClick={() => setSelectedPayment(p)}
            >
              <div className="proto-payment-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div className="proto-payment-info">
                <strong>{p.service}</strong>
                <span>{p.date}</span>
              </div>
              <div className="proto-payment-right">
                <strong className="proto-payment-amount">S/ {p.amount}</strong>
                <PaymentBadge status={p.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal comprobante */}
      <Modal open={!!selectedPayment} onClose={() => setSelectedPayment(null)}>
        {selectedPayment && (
          <div className="proto-payment-detail">
            <div className="proto-payment-detail-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E60023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <h3>Comprobante de pago</h3>
            {selectedPayment.receipt && (
              <span className="proto-payment-receipt">{selectedPayment.receipt}</span>
            )}
            <div className="proto-payment-detail-rows">
              <div className="proto-summary-row">
                <span>Servicio</span>
                <strong>{selectedPayment.service}</strong>
              </div>
              <div className="proto-summary-row">
                <span>Fecha</span>
                <strong>{selectedPayment.date}</strong>
              </div>
              <div className="proto-summary-divider" />
              <div className="proto-summary-row proto-summary-total">
                <span>Monto</span>
                <strong>S/ {selectedPayment.amount}</strong>
              </div>
              <div className="proto-summary-row">
                <span>Estado</span>
                <PaymentBadge status={selectedPayment.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
