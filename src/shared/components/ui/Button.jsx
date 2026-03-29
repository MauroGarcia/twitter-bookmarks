import clsx from 'clsx'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-4 py-3',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        'btn-base cursor-pointer disabled:cursor-not-allowed',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
