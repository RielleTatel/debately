import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'muted'
type Size = 'sm' | 'md'

type Props = {
  tone?: Tone
  size?: Size
  dot?: boolean
  className?: string
  children: React.ReactNode
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-foreground/[0.06] text-foreground ring-border',
  info: 'bg-primary/10 text-primary ring-primary/20',
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-warning/10 text-warning ring-warning/25',
  danger: 'bg-destructive/10 text-destructive ring-destructive/20',
  muted: 'bg-muted text-muted-foreground ring-border',
}

const dotClasses: Record<Tone, string> = {
  neutral: 'bg-foreground/60',
  info: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  muted: 'bg-muted-foreground',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-[11px] h-5 px-1.5 gap-1',
  md: 'text-xs h-6 px-2 gap-1.5',
}

export function StatusBadge({
  tone = 'neutral',
  size = 'sm',
  dot = false,
  className,
  children,
}: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium tracking-tight ring-1 ring-inset leading-none whitespace-nowrap',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            dotClasses[tone],
          )}
        />
      )}
      {children}
    </span>
  )
}
