import clsx from 'clsx'

const valueColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  default: 'text-on-surface',
}

export function StatCard({ label, value, description, color = 'default', children, className }) {
  return (
    <div className={clsx('stat-card', className)}>
      <p className="stat-label">{label}</p>
      {value !== undefined && (
        <p className={clsx('mt-2 font-headline text-4xl font-extrabold', valueColors[color] ?? valueColors.default)}>
          {value}
        </p>
      )}
      {description && <p className="mt-2 text-sm text-on-surface-variant">{description}</p>}
      {children}
    </div>
  )
}
