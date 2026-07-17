'use client'

import { useState, useCallback } from 'react'

type ConfirmState = {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
}

const defaultState: ConfirmState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirm: () => {},
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(defaultState)

  const confirm = useCallback(
    (title: string, description: string): Promise<boolean> =>
      new Promise((resolve) => {
        setState({
          isOpen: true,
          title,
          description,
          onConfirm: () => {
            setState(defaultState)
            resolve(true)
          },
        })
      }),
    []
  )

  const cancel = useCallback(() => {
    setState(defaultState)
  }, [])

  return { confirmState: state, confirm, cancel }
}
