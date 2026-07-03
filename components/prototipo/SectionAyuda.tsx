"use client"

import { useState } from "react"
import { mockFaq } from "./mockData"
import { SectionHeader, Kicker } from "./Shared"

export function SectionAyuda() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="proto-ayuda">
      {/* Banner de propuesta */}
      <div className="proto-proposal-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <strong>Seccion propuesta — requiere aprobacion</strong>
          <p>Esta seccion es una propuesta visual. El canal de soporte (WhatsApp, formulario, tickets) requiere aprobacion funcional antes de integrarse al proyecto real.</p>
        </div>
      </div>

      <SectionHeader
        kicker="Soporte"
        title="Ayuda"
        subtitle="Estamos aqui para resolver cualquier duda o problema."
      />

      {/* Contacto directo */}
      <div className="proto-ayuda-contact-grid">
        <a
          href="https://wa.me/51999999999"
          className="proto-contact-card"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.preventDefault()}
        >
          <div className="proto-contact-icon proto-contact-icon--green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12.003 2.003a10 10 0 0 0-8.683 14.975L2 22l5.163-1.29A10 10 0 1 0 12.003 2.003z" />
            </svg>
          </div>
          <div>
            <strong>WhatsApp soporte</strong>
            <p>Respuesta en menos de 2 horas en horario de atencion.</p>
          </div>
          <svg className="proto-contact-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>

        <button className="proto-contact-card">
          <div className="proto-contact-icon proto-contact-icon--red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <strong>Reportar un problema</strong>
            <p>Cuéntanos que paso y lo resolvemos rapidamente.</p>
          </div>
          <svg className="proto-contact-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Formulario de reporte */}
      <div className="proto-report-form">
        <Kicker>Reportar problema</Kicker>
        <h2 className="proto-card-title" style={{ marginTop: "0.6rem" }}>Cuentanos que paso</h2>
        <div className="proto-form-grid">
          <div className="proto-form-field">
            <label>Asunto</label>
            <select className="proto-input">
              <option>Beluer no llego</option>
              <option>Problema con el servicio</option>
              <option>Problema con el pago</option>
              <option>Otro</option>
            </select>
          </div>
          <div className="proto-form-field" style={{ gridColumn: "1 / -1" }}>
            <label>Describe el problema</label>
            <textarea className="proto-textarea" rows={4} placeholder="Ej: Mi Beluer llego tarde y..."></textarea>
          </div>
        </div>
        <button className="proto-btn-primary">
          Enviar reporte
        </button>
        <div className="proto-mock-note" style={{ marginTop: "0.75rem" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>En produccion: requiere endpoint de contacto o integracion con herramienta de soporte (Zendesk, Intercom, etc.).</span>
        </div>
      </div>

      {/* FAQ */}
      <div className="proto-faq-block">
        <Kicker>Preguntas frecuentes</Kicker>
        <h2 className="proto-card-title" style={{ marginTop: "0.6rem" }}>Resolvemos tus dudas</h2>
        <div className="proto-faq-list">
          {mockFaq.map((item, i) => (
            <div key={i} className={`proto-faq-item${openFaq === i ? " proto-faq-item--open" : ""}`}>
              <button
                className="proto-faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{item.q}</span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="proto-faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
