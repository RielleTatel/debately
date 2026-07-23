import Image from 'next/image'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  size?: number
  alt?: string
  priority?: boolean
}

export function Logo({ className, size = 24, alt = 'Debately', priority }: Props) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn('rounded-full object-cover', className)}
    />
  )
}
