'use client';

import { mockClientData, mockNextAppointment, mockServices, mockBeluers, mockStats } from './mockData';
import { StatusBadge, RatingStars } from './Shared';

export function SectionInicio() {
  const { firstName } = mockClientData;
  const { location } = mockClientData;
  const daysUntilRetoque = 20;

  return (
    <div className="proto-section proto-section-inicio">
      {/* Topbar Pill */}
      <div className="proto-topbar-pill">
        <div className="proto-topbar-location">
          <span className="proto-online-dot" />
          <span>{location}</span>
        </div>
        <button className="proto-topbar-heart">❤️</button>
      </div>

      {/* Greeting */}
      <h1 className="proto-greeting">
        Hola, {firstName} <span className="proto-belu-mark">✦</span>
      </h1>

      {/* Main Grid */}
      <div className="proto-main-grid">
        {/* Left: Appointment Card */}
        <div className="proto-appointment-card">
          <div className="proto-appointment-visual">
            <span className="proto-appointment-kicker">Próxima cita</span>
            <strong>{mockNextAppointment.service}</strong>
          </div>

          <div className="proto-appointment-content">
            <div className="proto-appointment-header">
              <StatusBadge status={mockNextAppointment.status} />
            </div>

            <h2>{mockNextAppointment.service}</h2>

            <div className="proto-beluer-row">
              <div className="proto-beluer-avatar">{mockNextAppointment.beluerInitials}</div>
              <span>{mockNextAppointment.beluer}</span>
            </div>

            <hr className="proto-divider" />

            <div className="proto-facts-grid">
              <div>
                <span>Fecha</span>
                <strong>{mockNextAppointment.date.toLocaleDateString('es-PE')}</strong>
              </div>
              <div>
                <span>Hora</span>
                <strong>{mockNextAppointment.time}</strong>
              </div>
              <div>
                <span>Duración</span>
                <strong>{mockNextAppointment.duration}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>S/ {mockNextAppointment.price}</strong>
              </div>
            </div>

            <div className="proto-appointment-actions">
              <button className="proto-btn proto-btn-primary">Ver detalles</button>
              <button className="proto-btn proto-btn-ghost">Reagendar</button>
              <button className="proto-btn proto-btn-ghost proto-btn-cancel">Cancelar</button>
            </div>
          </div>
        </div>

        {/* Right: Side Stack */}
        <div className="proto-side-stack">
          {/* Retoque Alert */}
          {daysUntilRetoque <= 21 && (
            <div className="proto-retoque-alert">
              <strong>Tu retoque está cerca</strong>
              <p>Reserva en los próximos {daysUntilRetoque} días para mejores resultados.</p>
              <button className="proto-btn proto-btn-primary" style={{ marginTop: '0.75rem' }}>
                Reservar retoque
              </button>
            </div>
          )}

          {/* Quick Access */}
          <div className="proto-card">
            <h3>Acceso rápido</h3>
            <div className="proto-quick-list">
              <button className="proto-quick-item">
                <span className="proto-quick-icon">↻</span>
                <span>Repetir último</span>
              </button>
              <button className="proto-quick-item">
                <span className="proto-quick-icon">🔍</span>
                <span>Explorar servicios</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="proto-stats-card">
            <div className="proto-stat">
              <strong>{mockStats.totalBookings}</strong>
              <span>Reservas</span>
            </div>
            <div className="proto-stat">
              <strong>{mockStats.favorites}</strong>
              <span>Favoritas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Services */}
      <section className="proto-explore-section">
        <h2>Explorar servicios</h2>
        <div className="proto-service-grid">
          {mockServices.slice(0, 4).map((service) => (
            <button key={service.id} className="proto-service-card">
              <span className="proto-service-category">{service.category[0]}</span>
              <h4>{service.name}</h4>
              <span className="proto-service-price">S/ {service.price}</span>
              <p>{service.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Beluers */}
      <section className="proto-beluers-section">
        <h2>Beluers destacadas</h2>
        <div className="proto-beluers-scroll">
          {mockBeluers.slice(0, 4).map((beluer) => (
            <div key={beluer.id} className="proto-beluer-card">
              <div className="proto-beluer-avatar">{beluer.initials}</div>
              <strong>{beluer.name}</strong>
              <RatingStars rating={beluer.rating} />
              <span className="proto-beluer-specialty">{beluer.specialties.join(', ')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
