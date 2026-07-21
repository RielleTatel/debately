import Link from 'next/link'
import { ArrowRight, Github, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

// TODO: replace with the real GitHub URL once the repo is public.
const GITHUB_URL = '#'

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
        <Heart className="h-3.5 w-3.5" strokeWidth={2} />
        Free and open source
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Debately is free. Forever.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
        No trials, no seats, no upgrade prompts. Use the hosted version at no
        cost, or run your own copy on your own infrastructure &mdash; the whole
        codebase is MIT licensed on GitHub.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/register">
          <Button
            size="lg"
            className="h-12 bg-blue-700 px-6 text-[15px] text-white hover:bg-blue-800"
          >
            Get started free
            <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.25} />
          </Button>
        </Link>
        <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
          <Button
            variant="ghost"
            size="lg"
            className="h-12 px-5 text-[15px] text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <Github className="mr-2 h-4 w-4" strokeWidth={2} />
            View on GitHub
          </Button>
        </Link>
      </div>
    </div>
  )
}
