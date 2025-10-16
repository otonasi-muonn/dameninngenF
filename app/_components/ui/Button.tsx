import { ComponentProps } from 'react'

type Props = ComponentProps<'button'> & { variant?: 'primary' | 'secondary' }

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium'
  const styles =
    variant === 'primary'
      ? 'bg-black text-white hover:bg-gray-800'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}
