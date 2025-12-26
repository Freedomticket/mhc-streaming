'use client'

import Link from 'next/link'
import { CHARTER_TEXT } from './charter-text'

export default function CharterPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-2">THE MHC CHARTER</h1>
        <h2 className="text-xl text-center mb-8">Charter for the Stewardship of Artistic Truth</h2>
        <p className="text-center italic mb-10">Adopted in stewardship, not ownership.</p>

        <article className="space-y-4 leading-relaxed">
          {CHARTER_TEXT.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        <section className="mt-12 space-y-2">
          <h3 className="text-2xl font-semibold">Colophon</h3>
          <p>This document is intended for archival, legal, and continuity purposes.</p>
          <p>It may be reproduced verbatim.</p>
          <p>No derivative versions may alter its meaning or intent.</p>
        </section>

        <div className="mt-10">
          <Link href="/" className="underline">← Back</Link>
        </div>
      </div>
    </main>
  )
}
