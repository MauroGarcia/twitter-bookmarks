import clsx from 'clsx'

export function Input({
  icon,
  trailing,
  wrapperClassName,
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={clsx('input-shell', wrapperClassName, className)}>
      {icon && <div className="input-leading">{icon}</div>}
      <input
        className={clsx('input-base', icon && 'pl-12', trailing && 'pr-12', inputClassName)}
        {...props}
      />
      {trailing && <div className="input-trailing">{trailing}</div>}
    </div>
  )
}
