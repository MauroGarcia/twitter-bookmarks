import clsx from 'clsx'

const sizes = {
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
}

export function Avatar({ src, name, size = 'md', className }) {
  const sizeClass = sizes[size] ?? sizes.md

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('avatar-base object-cover', sizeClass, className)}
      />
    )
  }

  return (
    <div className={clsx('avatar-base avatar-fallback', sizeClass, className)}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}
