'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { PlotProps } from './chart-plots'

const Plot = dynamic(() => import('./chart-plots').then((module) => module.ChartPlot), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse rounded bg-muted/50" />,
})
export function ChartHost(props: PlotProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ height: props.height }} aria-label={props.label}>
      {visible ? <Plot {...props} /> : <div className="h-full rounded bg-muted/30" />}
    </div>
  )
}
