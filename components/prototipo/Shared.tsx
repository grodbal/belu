"use client"

import { BookingStatus, PaymentStatus } from "./mockData"

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmada",
  in_progress: "En camino",
  completed: "Completada",
  cancelled: "Cancelada",
  pending: "Pendiente",
}

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  refunded: "Reembolsado",
  failed: "Fallido",
}

interface StatusBadgeProps {
  status: BookingStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`proto-badge proto-badge--${status}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

interface PaymentBadgeProps {
  status: PaymentStatus
}

export function PaymentBadge({ status }: PaymentBadgeProps) {
  return (
    <span className={`proto-badge proto-badge--payment-${status}`}>
      {PAYMENT_LABELS[status]}
    </span>
  )
}

// ─── KICKER ───────────────────────────────────────────────────────────────────

interface KickerProps {
  children: React.ReactNode
}

export function Kicker({ children }: KickerProps) {
  return <span className="proto-kicker">{children}</span>
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="proto-empty">
      <div className="proto-empty-icon">{icon ?? <span className="proto-star-lg">✦</span>}</div>
      <strong className="proto-empty-title">{title}</strong>
      {description && <p className="proto-empty-desc">{description}</p>}
      {action && (
        <button className="proto-btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  kicker?: string
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export function SectionHeader({ kicker, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="proto-section-header">
      <div className="proto-section-header-text">
        {kicker && <Kicker>{kicker}</Kicker>}
        <h1 className="proto-section-title">{title}</h1>
        {subtitle && <p className="proto-section-subtitle">{subtitle}</p>}
      </div>
      {action && (
        <button className="proto-btn-ghost" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

// ─── FILTER PILLS ─────────────────────────────────────────────────────────────

interface FilterPillsProps<T extends string> {
  options: { value: T; label: string }[]
  active: T
  onChange: (v: T) => void
}

export function FilterPills<T extends string>({ options, active, onChange }: FilterPillsProps<T>) {
  return (
    <div className="proto-filter-pills">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`proto-filter-pill${active === opt.value ? " proto-filter-pill--active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  initials: string
  size?: "sm" | "md" | "lg"
}

export function Avatar({ initials, size = "md" }: AvatarProps) {
  return <div className={`proto-avatar proto-avatar--${size}`}>{initials}</div>
}

// ─── DRAWER / BOTTOM SHEET ────────────────────────────────────────────────────

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  if (!open) return null
  return (
    <>
      <div className="proto-backdrop" onClick={onClose} />
      <div className="proto-drawer">
        <div className="proto-drawer-header">
          {title && <h2 className="proto-drawer-title">{title}</h2>}
          <button className="proto-drawer-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="proto-drawer-body">{children}</div>
      </div>
    </>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null
  return (
    <>
      <div className="proto-backdrop" onClick={onClose} />
      <div className="proto-modal">
        <button className="proto-modal-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </>
  )
}

// ─── REMINDER CARD ────────────────────────────────────────────────────────────

interface ReminderCardProps {
  days: number
  service: string
  onBook: () => void
}

export function ReminderCard({ days, service, onBook }: ReminderCardProps) {
  return (
    <div className="proto-reminder">
      <div className="proto-reminder-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="proto-reminder-text">
        <strong>Tu retoque se acerca</strong>
        <p>Han pasado {days} dias desde tu {service}. Reserva antes de los 21 dias para mejores resultados.</p>
      </div>
      <button className="proto-btn-primary proto-btn-primary--sm" onClick={onBook}>
        Reservar retoque
      </button>
    </div>
  )
}

// ─── TRUST CARD ───────────────────────────────────────────────────────────────

export function TrustCard() {
  const items = [
    { icon: "✦", title: "Beluers verificadas", desc: "Cada especialista pasa por proceso de seleccion riguroso." },
    { icon: "✦", title: "Atencion en tu domicilio", desc: "Tu Beluer llega puntual con todo el equipo necesario." },
    { icon: "✦", title: "Garantia belu", desc: "Si algo no esta bien, lo resolvemos sin costo adicional." },
  ]
  return (
    <div className="proto-trust-card">
      <Kicker>Por que belu</Kicker>
      <h2 className="proto-card-title">Tu seguridad, nuestra prioridad</h2>
      <div className="proto-trust-list">
        {items.map((item) => (
          <div key={item.title} className="proto-trust-row">
            <span className="proto-trust-icon">{item.icon}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
