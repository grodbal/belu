"use client";

import type { ReactNode } from "react";
import { PrimaryButton } from "../ui/Button";
import styles from "./booking-flow.module.css";

type BookingFlowProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  summary: ReactNode;
};

export function BookingFlow({
  eyebrow,
  title,
  description,
  children,
  summary,
}: BookingFlowProps) {
  return (
    <section className={styles.flow} aria-labelledby="booking-flow-title">
      <header className={styles.intro}>
        <p>{eyebrow}</p>
        <h1 id="booking-flow-title">{title}</h1>
        <span>{description}</span>
      </header>

      <div className={styles.layout}>
        <div className={styles.steps}>{children}</div>
        {summary}
      </div>
    </section>
  );
}

type BookingStepProps = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function BookingStep({
  number,
  eyebrow,
  title,
  description,
  children,
}: BookingStepProps) {
  return (
    <section className={styles.step}>
      <header className={styles.stepHeader}>
        <span className={styles.stepNumber}>{number}</span>
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </header>
      <div className={styles.stepBody}>{children}</div>
    </section>
  );
}

type BookingOptionProps = {
  media?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actionLabel: string;
  onAction: () => void;
  empty?: boolean;
};

export function BookingOption({
  media,
  eyebrow,
  title,
  description,
  meta,
  actionLabel,
  onAction,
  empty = false,
}: BookingOptionProps) {
  return (
    <article className={`${styles.option} ${empty ? styles.emptyOption : ""}`}>
      {media ? <div className={styles.optionMedia}>{media}</div> : null}
      <div className={styles.optionContent}>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h3>{title}</h3>
        {description ? <span>{description}</span> : null}
        {meta ? <div className={styles.optionMeta}>{meta}</div> : null}
      </div>
      <button className={styles.optionAction} type="button" onClick={onAction}>
        {actionLabel}
      </button>
    </article>
  );
}

export function BookingFields({ children }: { children: ReactNode }) {
  return <div className={styles.fields}>{children}</div>;
}

type BookingFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export function BookingField({
  label,
  hint,
  children,
  fullWidth = false,
}: BookingFieldProps) {
  return (
    <label className={`${styles.field} ${fullWidth ? styles.fieldWide : ""}`}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

type BookingToggleProps = {
  checked: boolean;
  disabled?: boolean;
  title: string;
  description?: string;
  onChange: (checked: boolean) => void;
};

export function BookingToggle({
  checked,
  disabled,
  title,
  description,
  onChange,
}: BookingToggleProps) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {description ? <small>{description}</small> : null}
      </div>
    </label>
  );
}

export function BookingNotice({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: string;
}) {
  return (
    <div className={styles.notice}>
      <strong>{title}</strong>
      <p>{children}</p>
      {footer ? <small>{footer}</small> : null}
    </div>
  );
}

export function BookingChoiceGrid({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.choiceBlock}>
      <strong>{title}</strong>
      <div className={styles.choiceGrid}>{children}</div>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

type BookingChoiceProps = {
  media: ReactNode;
  title: string;
  meta: string;
  selected: boolean;
  onSelect: () => void;
};

export function BookingChoice({
  media,
  title,
  meta,
  selected,
  onSelect,
}: BookingChoiceProps) {
  return (
    <button
      className={`${styles.choice} ${selected ? styles.selectedChoice : ""}`}
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={styles.choiceMedia}>{media}</span>
      <span>
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
    </button>
  );
}

type BookingSummaryProps = {
  serviceName?: string;
  serviceDescription?: string;
  servicePrice?: string;
  date: string;
  time: string;
  district: string;
  address: string;
  logisticFee?: string;
  expressFee?: string;
  total?: string;
  expressNote?: string;
  onConfirm: () => void;
};

export function BookingSummary({
  serviceName,
  serviceDescription,
  servicePrice,
  date,
  time,
  district,
  address,
  logisticFee,
  expressFee,
  total,
  expressNote,
  onConfirm,
}: BookingSummaryProps) {
  const hasService = Boolean(serviceName);

  return (
    <aside className={styles.summary} aria-labelledby="booking-summary-title">
      <header>
        <p>Resumen</p>
        <h2 id="booking-summary-title">Tu reserva <span aria-hidden="true">✦</span></h2>
        <span>Revisa los datos principales antes de continuar.</span>
      </header>

      {hasService ? (
        <div className={styles.summaryContent}>
          <div className={styles.summaryService}>
            <span>Servicio</span>
            <strong>{serviceName}</strong>
            {serviceDescription ? <p>{serviceDescription}</p> : null}
          </div>

          <dl className={styles.summaryFacts}>
            <div><dt>Fecha</dt><dd>{date}</dd></div>
            <div><dt>Hora</dt><dd>{time}</dd></div>
            <div><dt>Distrito</dt><dd>{district || "Pendiente"}</dd></div>
            <div><dt>Dirección</dt><dd>{address || "Pendiente de completar"}</dd></div>
          </dl>

          <dl className={styles.summaryPrices}>
            <div><dt>{serviceName}</dt><dd>{servicePrice}</dd></div>
            <div><dt>Cargo logístico</dt><dd>{logisticFee}</dd></div>
            {expressFee ? <div><dt>Belu Express</dt><dd>{expressFee}</dd></div> : null}
          </dl>

          <div className={styles.summaryTotal}>
            <span>Total</span>
            <strong>{total}</strong>
          </div>

          {expressNote ? <p className={styles.expressNote}>{expressNote}</p> : null}
        </div>
      ) : (
        <div className={styles.summaryEmpty}>
          <strong>Elige un servicio para comenzar.</strong>
          <span>Aquí aparecerán fecha, hora, ubicación y total.</span>
        </div>
      )}

      <PrimaryButton className={styles.summaryAction} onClick={onConfirm}>
        Confirmar reserva
      </PrimaryButton>
    </aside>
  );
}
