import clsx from 'clsx'

const labelColors = {
  primary: 'text-primary/80',
  secondary: 'text-secondary/80',
}

export function SectionHeader({ label, title, description, labelColor = 'primary', actions }) {
  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className={clsx('section-label', labelColors[labelColor] ?? labelColors.primary)}>
          {label}
        </p>
        <h2 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
