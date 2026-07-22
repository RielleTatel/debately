import { cn } from '@/lib/utils'

type Variant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info'
  | 'muted'

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
  secondary: 'bg-foreground/[0.06] text-foreground ring-1 ring-inset ring-border',
  outline: 'text-foreground ring-1 ring-inset ring-border-strong',
  destructive:
    'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20',
  success:
    'bg-success/10 text-success ring-1 ring-inset ring-success/20',
  warning:
    'bg-warning/10 text-warning ring-1 ring-inset ring-warning/25',
  info: 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
  muted: 'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tracking-tight leading-none h-[22px]',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
