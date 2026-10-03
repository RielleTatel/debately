'use client'

import { useEffect } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

export function useRosterDraft<T extends FieldValues>(
  key: string | undefined,
  form: UseFormReturn<T>,
) {
  useEffect(() => {
    if (!key) return
    const storageKey = `roster-draft:${key}`
    const defaults = form.getValues()
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')
      if (stored && typeof stored === 'object') {
        const fields = Object.fromEntries(
          Object.entries(stored).filter(
            ([name, value]) =>
              !name.endsWith('Id') && name in defaults && typeof value === typeof defaults[name],
          ),
        )
        form.reset({ ...defaults, ...fields }, { keepDefaultValues: true })
      }
    } catch {
      /* Browser storage can be unavailable. Editing must still work. */
    }
    const subscription = form.watch((values) => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(values))
      } catch {
        /* Best effort draft retention. */
      }
    })
    return () => subscription.unsubscribe()
  }, [key, form])
  return () => {
    if (key) {
      try {
        sessionStorage.removeItem(`roster-draft:${key}`)
      } catch {
        /* Best effort draft retention. */
      }
    }
  }
}
