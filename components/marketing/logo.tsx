import type { SVGProps } from 'react'

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 5.5C4 4.11929 5.11929 3 6.5 3H12C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21H6.5C5.11929 21 4 19.8807 4 18.5V5.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="9" cy="12" r="1.75" fill="currentColor" />
    </svg>
  )
}
