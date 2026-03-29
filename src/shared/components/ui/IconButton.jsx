import clsx from 'clsx'

export function IconButton({ icon, className, ...props }) {
  return (
    <button className={clsx('icon-button cursor-pointer disabled:cursor-not-allowed', className)} {...props}>
      {icon}
    </button>
  )
}
