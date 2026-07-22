import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'subtle'
type Size = 'default' | 'sm' | 'lg' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  default:
    'bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12)] hover:bg-primary/92 active:translate-y-[0.5px]',
  secondary:
    'bg-foreground/[0.04] text-foreground border border-border hover:bg-foreground/[0.06] active:translate-y-[0.5px]',
  outline:
    'border border-border-strong bg-transparent text-foreground hover:bg-foreground/[0.04] active:translate-y-[0.5px]',
  ghost:
    'text-foreground hover:bg-foreground/[0.06] active:translate-y-[0.5px]',
  subtle:
    'bg-primary/10 text-primary hover:bg-primary/15 active:translate-y-[0.5px]',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:translate-y-[0.5px]',
  link:
    'text-primary underline-offset-4 hover:underline px-0',
}

const sizeClasses: Record<Size, string> = {
  default: 'h-9 px-3.5 text-sm',
  sm: 'h-8 px-3 text-[13px]',
  lg: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium tracking-tight',
        'transition-colors duration-150 select-none whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
