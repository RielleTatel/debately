'use client'
import { createContext, useContext, useRef, type ReactNode, type MutableRefObject } from 'react'
import { cn } from '@/lib/utils'

type TriggerMeta = { id?: string; className?: string }
type SelectCtx = {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  triggerMeta: MutableRefObject<TriggerMeta>
}

const Ctx = createContext<SelectCtx>({ triggerMeta: { current: {} } })

type SelectProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: ReactNode
}

export function Select({ value, onValueChange, disabled, children }: SelectProps) {
  const triggerMeta = useRef<TriggerMeta>({})
  return (
    <Ctx.Provider value={{ value, onValueChange, disabled, triggerMeta }}>
      {children}
    </Ctx.Provider>
  )
}

// SelectTrigger and SelectContent are siblings inside Select. SelectTrigger writes its
// id/className into a shared ref so SelectContent (which renders the actual <select>) can
// pick them up — React renders children top-to-bottom so the write happens before the read.
export function SelectTrigger({ id, className, children }: { id?: string; className?: string; children?: ReactNode }) {
  const { triggerMeta } = useContext(Ctx)
  triggerMeta.current = { id, className }
  // SelectValue (the only expected child) renders null; nothing visible here.
  return <>{children}</>
}

export function SelectValue({ placeholder: _placeholder }: { placeholder?: string }) {
  return null
}

export function SelectContent({ children, className }: { children: ReactNode; className?: string }) {
  const { value, onValueChange, disabled, triggerMeta } = useContext(Ctx)
  const { id, className: triggerClass } = triggerMeta.current
  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onValueChange?.(e.target.value)}
      disabled={disabled}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        triggerClass,
        className
      )}
    >
      {children}
    </select>
  )
}

export function SelectItem({ value, children, disabled }: { value: string; children: ReactNode; disabled?: boolean }) {
  return <option value={value} disabled={disabled}>{children}</option>
}
