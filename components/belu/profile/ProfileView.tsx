"use client";

import type { ReactNode } from "react";
import { BeluIcon } from "../foundations/BeluIcon";
import { PrimaryButton } from "../ui";
import styles from "./profile.module.css";

type ProfileViewProps = {
  name: string;
  email: string;
  phone: string;
  beautyPreference: string;
  initials: string;
  bookingCount: number;
  isSaving: boolean;
  logoutAction: ReactNode;
  onPhoneChange: (value: string) => void;
  onBeautyPreferenceChange: (value: string) => void;
  onSave: () => void;
};

export function ProfileView({
  name,
  email,
  phone,
  beautyPreference,
  initials,
  bookingCount,
  isSaving,
  logoutAction,
  onPhoneChange,
  onBeautyPreferenceChange,
  onSave,
}: ProfileViewProps) {
  return (
    <section className={styles.page} aria-labelledby="client-profile-title">
      <header className={styles.intro}>
        <p>Tu cuenta</p>
        <h1 id="client-profile-title">Mi perfil</h1>
        <span>
          Mantén tus datos actualizados para una experiencia belu más precisa.
        </span>
      </header>

      <div className={styles.layout}>
        <aside className={styles.identity} aria-label="Identidad de clienta">
          <div className={styles.avatar} aria-hidden="true">
            {initials || "C"}
          </div>
          <p className={styles.identityEyebrow}>Clienta belu</p>
          <h2>{name}</h2>
          <span className={styles.identityEmail}>{email}</span>

          <div className={styles.bookingMetric}>
            <strong>{bookingCount}</strong>
            <span>{bookingCount === 1 ? "reserva" : "reservas"}</span>
          </div>
        </aside>

        <div className={styles.content}>
          <section className={styles.formSection} aria-labelledby="profile-data-title">
            <div className={styles.sectionHeading}>
              <div>
                <p>Información personal</p>
                <h2 id="profile-data-title">Datos personales</h2>
              </div>
              <span>Los campos de identidad no pueden editarse aquí.</span>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field} htmlFor="profile-full-name">
                <span>Nombre completo</span>
                <input
                  id="profile-full-name"
                  type="text"
                  value={name}
                  readOnly
                />
              </label>

              <label className={styles.field} htmlFor="profile-email">
                <span>Email</span>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                />
              </label>

              <label className={styles.field} htmlFor="profile-phone">
                <span>Teléfono</span>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => onPhoneChange(event.target.value)}
                />
              </label>

              <label
                className={`${styles.field} ${styles.fieldWide}`}
                htmlFor="profile-beauty-preference"
              >
                <span>Preferencia de belleza</span>
                <select
                  id="profile-beauty-preference"
                  value={beautyPreference}
                  onChange={(event) =>
                    onBeautyPreferenceChange(event.target.value)
                  }
                >
                  <option value="" disabled>
                    Selecciona una preferencia
                  </option>
                  <option value="Lashes naturales">Lashes naturales</option>
                  <option value="Lashes con volumen">
                    Lashes con volumen
                  </option>
                  <option value="Nails minimalistas">Nails minimalistas</option>
                  <option value="Nails protagonistas">
                    Nails protagonistas
                  </option>
                  <option value="Lashes y nails">Lashes y nails</option>
                </select>
              </label>
            </div>

            <div className={styles.saveRow}>
              <p>
                <BeluIcon name="shield" size={17} aria-hidden="true" />
                Tus datos se usan para coordinar tus reservas.
              </p>
              <PrimaryButton
                className={styles.saveButton}
                type="button"
                onClick={onSave}
                disabled={isSaving || !beautyPreference}
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </PrimaryButton>
            </div>
          </section>

          <section className={styles.session} aria-labelledby="profile-session-title">
            <div>
              <p>Acceso</p>
              <h2 id="profile-session-title">Sesión</h2>
              <span>Cierra tu sesión de forma segura en este dispositivo.</span>
            </div>
            <div className={styles.logoutAction}>{logoutAction}</div>
          </section>
        </div>
      </div>
    </section>
  );
}
