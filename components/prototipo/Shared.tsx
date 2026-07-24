'use client';

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    confirmed: { label: 'Confirmada', className: 'confirmed' },
    completed: { label: 'Completada', className: 'completed' },
    cancelled: { label: 'Cancelada', className: 'cancelled' },
    paid: { label: 'Pagado', className: 'paid' },
  };

  const info = statusMap[status] || { label: status, className: '' };

  return <span className={`proto-badge proto-badge-${info.className}`}>{info.label}</span>;
}

export function EmptyState({ title, description, cta }: { title: string; description: string; cta?: string }) {
  return (
    <div className="proto-empty-state">
      <div className="proto-empty-icon">✦</div>
      <h2>{title}</h2>
      <p>{description}</p>
      {cta && <button className="proto-btn proto-btn-primary">{cta}</button>}
    </div>
  );
}

export function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="proto-rating">
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 !== 0 && '½'}
      {' '}
      <span className="proto-rating-value">{rating}</span>
    </span>
  );
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`proto-btn proto-btn-${variant}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
