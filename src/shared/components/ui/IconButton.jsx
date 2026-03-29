import clsx from 'clsx'

export function IconButton({ icon, className, ...props }) {
  return (
    <button className={clsx('icon-button', className)} {...props}>
      {icon}
    </button>
  )
}
