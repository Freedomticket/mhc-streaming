'use client'

import Link from 'next/link'
import { EB_Garamond, Crimson_Text } from 'next/font/google'
import { CHARTER_TEXT } from './charter-text'

const eb = EB_Garamond({ subsets: ['latin'], weight: ['400','600','700'] })
const crimson = Crimson_Text({ subsets: ['latin'], weight: ['400','600','700'] })

export default function CharterPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Print styles */}
      <style jsx global>{`
        @page { size: 8.5in 11in; margin: 1in; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; }
          .article-break { page-break-before: always; break-before: page; }
          .rule { border-bottom: 1px solid #000; }
        }
        .rule { border-bottom: 1px solid #000; }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-16 z-40 border-b border-gray-200 bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="text-sm">
          <Link href="/" className="underline">← Back</Link>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-inferno text-sm">Print / Save PDF</button>
        </div>
      </div>

      <div className={`mx-auto max-w-3xl px-6 py-12 ${eb.className}`}>
        {/* Cover Page */}
        <section>
          <h1 className="text-4xl font-bold tracking-tight text-center mb-2">THE MHC CHARTER</h1>
          <h2 className="text-xl text-center mb-8">Charter for the Stewardship of Artistic Truth</h2>
          <div className="rule mb-8" />
          <p className="text-center italic">Adopted in stewardship, not ownership.</p>
        </section>

        {/* Publication spec note (screen only) */}
        <section className="no-print mt-10 text-sm text-gray-600">
          <p>This page is formatted for print/PDF. Use the Print button above to export to US Letter with 1 inch margins. Typography uses EB Garamond (titles) and Crimson Text (body). Black text on white background only.</p>
        </section>

        {/* Charter body */}
        <section className={`mt-12 leading-relaxed ${crimson.className}`}>
          <h3 className="sr-only">The MHC Charter (verbatim)</h3>
          <article className="prose prose-neutral max-w-none">
            {CHARTER_TEXT.split('\n\n').map((para, i) => (
              <p key={i} className="text-[1.05rem]">{para}</p>
            ))}
          </article>
        </section>

        {/* Colophon */}
        <section className="page-break mt-16">
          <h3 className="text-2xl font-semibold mb-4">Colophon</h3>
          <p className="mb-2">This document is intended for archival, legal, and continuity purposes.</p>
          <p className="mb-2">It may be reproduced verbatim.</p>
          <p>No derivative versions may alter its meaning or intent.</p>
        </section>

        {/* Technical Appendix */}
        <section className="page-break mt-16">
          <h2 className="text-3xl font-bold mb-6">Technical Appendix to The MHC Charter</h2>
          <h3 className="text-xl font-semibold mb-3">A. Governance as Code</h3>
          <p className="mb-2">The Charter is enforced through system constraints, not trust.</p>
          <ul className="list-disc pl-6 mb-4">
            <li>No single admin role</li>
            <li>All privileged actions logged</li>
            <li>All irreversible actions require multi-step confirmation</li>
          </ul>
          <p className="font-semibold mb-1">Examples:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Deleting artist data → requires quorum approval</li>
            <li>Policy changes → versioned + auditable</li>
            <li>AI moderation → advisory only, never final authority</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">B. Access Control</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>Role-based access control (RBAC)</li>
            <li>Roles are scoped, not hierarchical</li>
            <li>Emergency privileges are time-limited and logged</li>
          </ul>
          <pre className="bg-gray-100 text-black p-4 text-sm mb-6 whitespace-pre-wrap">
ROLE: Steward
- Cannot delete audit logs
- Cannot override legality filters
- Cannot grant permanent admin rights
          </pre>

          <h3 className="text-xl font-semibold mb-3">C. Audit & Transparency</h3>
          <p className="mb-2">Every sensitive operation writes to an immutable log:</p>
          <pre className="bg-gray-100 text-black p-4 text-sm mb-6 whitespace-pre-wrap">{
  "actor": "steward_id",
  "action": "CONTENT_REMOVAL",
  "reason": "LEGAL_VIOLATION",
  "timestamp": "ISO-8601",
  "reviewable": true
}</pre>
          <ul className="list-disc pl-6 mb-6">
            <li>Logs are append-only</li>
            <li>Encrypted at rest</li>
            <li>Exportable for lawful review</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">D. Illegal Content Enforcement</h3>
          <p className="mb-2">Upload pipeline includes:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Hash checks</li>
            <li>Pattern detection</li>
            <li>Human review gates</li>
          </ul>
          <p className="mb-6">Content flagged as illegal is never published, cached, or monetized and is permanently blocked at the storage level.</p>

          <h3 className="text-xl font-semibold mb-3">E. AI Constraints</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>AI cannot ban accounts, delete content, alter rankings, or modify governance rules</li>
            <li>AI may only flag, suggest, summarize, and assist discovery</li>
            <li>Final authority rests with humans bound by the Charter</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">F. Continuity & Fail-Safe Design</h3>
          <ul className="list-disc pl-6 mb-2">
            <li>Charter-critical logic duplicated across services</li>
            <li>No centralized kill switch</li>
            <li>Cold storage of Charter text, governance keys, recovery instructions</li>
          </ul>
          <p>If the Charter cannot be enforced technically, the platform is considered compromised.</p>
        </section>

        {/* Public Summary */}
        <section className="page-break mt-16">
          <h2 className="text-3xl font-bold mb-6">The MHC Charter — Public Summary (For Artists)</h2>
          <h3 className="text-xl font-semibold mb-2">Why MHC Streaming Exists</h3>
          <p className="mb-4">MHC Streaming was built to protect artists from systems that treat creativity as disposable. It exists so your work is not buried by opaque algorithms, silenced for convenience, owned by platforms you cannot leave, or manipulated by fake engagement.</p>
          <h3 className="text-xl font-semibold mb-2">What MHC Promises</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You keep ownership of your work</li>
            <li>You can leave at any time</li>
            <li>Your content will not be altered without consent</li>
            <li>No illegal content is allowed—ever</li>
            <li>No fake artists, no artificial manipulation</li>
          </ul>
          <p className="mb-4">This platform exists to serve creation, not control it.</p>
          <h3 className="text-xl font-semibold mb-2">What MHC Will Not Do</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Seize your rights</li>
            <li>Exploit your audience</li>
            <li>Sacrifice truth for growth</li>
            <li>Allow AI or corporations to override human accountability</li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">Your Responsibility</h3>
          <p className="mb-4">Freedom requires responsibility. By using MHC Streaming, artists agree to create lawfully, respect others, reject manipulation, and value truth over reach.</p>
          <h3 className="text-xl font-semibold mb-2">The Long View</h3>
          <p className="mb-4">MHC Streaming is designed to outlast trends, founders, and platforms. It exists so art survives even when systems fail.</p>
          <h3 className="text-xl font-semibold mb-2">In Closing</h3>
          <p>This is not a promise of fame. It is a promise of integrity.</p>
        </section>
      </div>
    </main>
  )
}