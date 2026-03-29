import clsx from 'clsx'

const textVariants = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  tertiary: 'badge-tertiary',
  default: 'badge-default',
}

const iconVariants = {
  primary: 'badge-icon-primary',
  secondary: 'badge-icon-secondary',
  tertiary: 'badge-icon-tertiary',
  default: 'badge-icon-default',
}

const sizes = {
  sm: 'px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
  md: 'px-4 py-1.5 text-xs font-bold',
}

export function Badge({ tone = 'default', size = 'md', icon, children, className, ...props }) {
  if (icon && !children) {
    return (
      <span className={clsx('badge-icon', iconVariants[tone] ?? iconVariants.default, className)} {...props}>
        {icon}
      </span>
    )
  }

  return (
    <span className={clsx('badge-base', textVariants[tone] ?? textVariants.default, sizes[size] ?? sizes.md, className)} {...props}>
      {icon}
      {children}
    </span>
  )
}
