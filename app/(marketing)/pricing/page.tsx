import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Github, Heart } from 'lucide-react'
import { GITHUB_REPOSITORY_URL } from '@/components/marketing/urls'

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
        <Heart className="h-3.5 w-3.5" strokeWidth={2} />
        Simple, transparent pricing
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Debately is free. Forever.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
        No trials, no seats, no upgrade prompts. Use the hosted version at no
        cost, or review the publicly available codebase on GitHub before
        deciding how you want to run it.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/register"
          className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-blue-700 px-6 text-[15px] font-medium tracking-tight text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Get started free
          <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
        </Link>
        <Link
          href={GITHUB_REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-md px-5 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Github className="h-4 w-4" strokeWidth={2} />
          View on GitHub
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>
    </div>
  )
}
