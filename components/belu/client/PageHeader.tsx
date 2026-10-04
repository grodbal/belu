import styles from "./client.module.css";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  titleId: string;
  accent?: boolean;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  titleId,
  accent = false,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={[styles.pageHeader, className].filter(Boolean).join(" ")}
    >
      <p>
        {eyebrow}
        {accent ? <span aria-hidden="true"> ✦</span> : null}
      </p>
      <h1 id={titleId}>{title}</h1>
      <span>{description}</span>
    </header>
  );
}
