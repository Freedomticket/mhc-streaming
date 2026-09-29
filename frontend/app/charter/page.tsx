'use client'

import Link from 'next/link'
import { useState } from 'react'

const CHARTER_ARTICLES = [
  {
    number: 'Preamble',
    title: null,
    content: `MHC Streaming exists to preserve artistic creation, truthful expression, and cultural memory against corruption, coercion, and erasure. This Charter establishes the principles, limits, and obligations by which MHC Streaming is governed. It binds all stewards, operators, contributors, and future custodians of the platform — human or artificial — to act in service of truth, continuity, and lawful responsibility. This Charter is not a declaration of moral superiority. It is a declaration of constraint. Where power exists, it shall be limited. Where authority exists, it shall be accountable. Where creation exists, it shall be protected.`
  },
  {
    number: 'Article I',
    title: 'Purpose',
    content: `MHC Streaming exists to provide an independent, resilient platform for artistic creation, distribution, and preservation. The platform shall prioritize artistic sovereignty, truthful expression, cultural continuity, and lawful operation. MHC Streaming shall not exist to maximize profit at the expense of creators, truth, or public responsibility.`
  },
  {
    number: 'Article II',
    title: 'Lawful Operation',
    content: `MHC Streaming shall operate within the bounds of applicable law in every jurisdiction in which it is accessible. Illegal content is strictly prohibited and shall never be hosted, promoted, monetized, or preserved. This includes content involving abuse or exploitation, non-consensual material, terrorism, criminal coordination, fraud, or any material prohibited by law. Enforcement of legality shall take precedence over ideology, revenue, or popularity.`
  },
  {
    number: 'Article III',
    title: 'Artistic Sovereignty',
    content: `Artists retain ownership of their original works unless explicitly transferred by lawful contract. MHC Streaming shall not seize artist intellectual property, alter creative works without consent, or suppress lawful expression for political, financial, or reputational convenience. Artists may leave the platform freely and export their works and data, subject only to lawful obligations.`
  },
  {
    number: 'Article IV',
    title: 'Human-Sparked Creation & AI Policy',
    content: `MHC Streaming recognizes that artificial intelligence is a tool — not an artist. The platform embraces AI-assisted creation where a human being has made meaningful creative decisions in the work.

PERMITTED: AI-assisted music is welcomed when a human creator has meaningfully directed, curated, edited, or expressed authentic intent through AI tools. This includes AI co-production, AI-generated stems within human compositions, vocal synthesis used expressively, and AI mixing or mastering assistance.

PROHIBITED: Bulk AI uploads — the mass generation and submission of AI-produced tracks without meaningful human curation — are strictly forbidden. This floods the catalog and undermines authentic artist discovery.

UPLOAD LIMITS BY TIER:
◦ Free Trial: 2 uploads per week
◦ Basic: 5 uploads per week
◦ Pro: 15 uploads per week
◦ Enterprise: Custom limits with review

All uploads require a creator declaration confirming Human-Sparked Creation standards. False declarations result in immediate account suspension. Deepfake vocals of real artists without consent are strictly prohibited.`
  },
  {
    number: 'Article V',
    title: 'Stewardship and Power',
    content: `No individual, group, corporation, or artificial system may exercise unchecked authority over MHC Streaming. Stewards exist to maintain, not dominate. Stewardship is conditional and revocable. All stewards are bound by this Charter regardless of seniority, contribution, or tenure.`
  },
  {
    number: 'Article VI',
    title: 'Artificial Intelligence Governance',
    content: `Artificial intelligence systems may be used as tools, never as sovereign decision-makers. AI systems shall operate under human oversight, be auditable, and be constrained by this Charter. No AI may override lawful moderation, safety controls, or human judgment. AI systems shall never be granted independent authority over governance, enforcement, or continuity.`
  },
  {
    number: 'Article VII',
    title: 'Moderation and Protection',
    content: `MHC Streaming shall maintain active moderation to enforce legality, prevent exploitation, and defend against fraud and manipulation. Moderation shall be documented, reviewable, and subject to appeal. Moderation exists to protect artists and the public, not to enforce ideology.`
  },
  {
    number: 'Article VIII',
    title: 'Continuity and Survival',
    content: `MHC Streaming shall be architected to survive corporate pressure, political interference, infrastructure failure, and leadership loss. Continuity plans, offline archives, and succession mechanisms shall be maintained and tested. No single point of failure — human, technical, or legal — shall be permitted.`
  },
  {
    number: 'Article IX',
    title: 'Anti-Corruption',
    content: `Manipulation of metrics, artificial amplification, or fraudulent activity is prohibited. Bot networks, fake artists, synthetic manipulation, or deceptive practices shall be actively detected and removed. Transparency shall be preferred over secrecy where safety permits.`
  },
  {
    number: 'Article X',
    title: 'Royalties and Economic Conduct',
    content: `Monetization systems shall be clear, opt-in, and fair. MHC Streaming shall maintain stream logging and reporting infrastructure sufficient to enable artist royalty calculation and PRO submission.

STREAMING ROYALTIES: The per-stream rate is determined by the platform revenue pool divided by total streams per period, weighted by tier. Rates are published publicly and updated quarterly.

LICENSING ROYALTIES: Artists receive 70% of net licensing fees. MHC Streaming retains 30% as a platform fee.

REPORTING CYCLE: Royalty statements generated monthly, available in the artist dashboard by the 15th of the following month. Payments processed by the last business day of each month.

ROYALTY AUDIT RIGHTS: Artists may request an audit for any period within 24 months. One audit per artist per year at no cost.

Financial practices shall not exploit artists, audiences, or stewards. No economic incentive shall override legality or safety.`
  },
  {
    number: 'Article XI',
    title: 'Sovereign Sound Vault Publishing LLC',
    content: `MHC Streaming operates Sovereign Sound Vault Publishing LLC — an artist-first publishing administration company built to return money and power to creators.

WHAT WE DO: When an artist opts in, Sovereign Sound Vault Publishing LLC will register their songs with their Performing Rights Organization (ASCAP, BMI, or SESAC), pitch their music for sync licensing opportunities — TV, film, commercials, video games, and more — collect and distribute performance and sync royalties directly to the artist, and advocate for their music in spaces most independent artists never reach.

THE DEAL: Sovereign Sound Vault Publishing LLC operates on a 15% administration fee. Artists keep 85% of all royalties generated — including sync fees, performance royalties, and mechanical royalties. Artists retain 100% ownership of their masters and their writer's share. We never take ownership of your music.

We only earn when you earn. That is the MHC way.

HOW TO OPT IN: Artists may submit individual tracks to Sovereign Sound Vault Publishing LLC at the time of upload. There is no blanket deal. Each track may be opted in or out independently, at any time.

WHY WE BUILT THIS: Most independent artists leave thousands of dollars uncollected every year because they do not have access to publishing administration. Labels and major publishers gatekeep this process and take the lion's share. Sovereign Sound Vault Publishing LLC gives every artist on MHC Streaming — from day one — the same infrastructure major label artists have. The only difference is you keep what is yours.`,
    badge: '⚡ New 2026 — Sovereign Sound Vault Publishing LLC'
  },
  {
    number: 'Article XII',
    title: 'Succession',
    content: `Leadership and stewardship shall never be hereditary, permanent, or absolute. Succession shall be governed by competence, integrity, and adherence to this Charter. Any steward who violates this Charter forfeits authority.`
  },
  {
    number: 'Article XIII',
    title: 'Amendment',
    content: `This Charter may be amended only through documented review, multi-party agreement, and preservation of core principles. Amendments shall not weaken lawful operation, artistic sovereignty, anti-corruption safeguards, or human oversight.`
  },
  {
    number: 'Article XIV',
    title: 'Final Provision',
    content: `This Charter exists not to claim truth, but to protect it. If MHC Streaming survives beyond its founders, it shall do so because this Charter restrained power when restraint was difficult. If this Charter is ever abandoned, the platform shall be considered compromised, regardless of size or success.`
  },
]

export default function CharterPage() {
  const [activeArticle, setActiveArticle] = useState<string | null>(null)

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        .ch-cinzel { font-family: 'Cinzel', serif; }
        .ch-garamond { font-family: 'EB Garamond', Georgia, serif; }
        .ch-article { border-bottom: 1px solid #0f0f0f; padding: 28px 0; cursor: pointer; transition: all .2s; }
        .ch-article:hover { padding-left: 8px; }
        .ch-article-num { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; margin-bottom: 6px; }
        .ch-article-title { font-family: 'Cinzel', serif; font-size: 16px; color: #e8e0d0; letter-spacing: 1px; margin-bottom: 0; }
        .ch-article-content { font-family: 'EB Garamond', Georgia, serif; font-size: 16px; color: #555; line-height: 1.9; margin-top: 16px; white-space: pre-wrap; }
        .ch-article.active .ch-article-content { color: #888; }
        .ch-article.active .ch-article-title { color: #fff; }
        .ch-divider { width: 48px; height: 1px; background: linear-gradient(to right, transparent, #c9a84c, transparent); margin: 0 auto; }
        .ch-ai-badge { display: inline-flex; align-items: center; gap: 6px; font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px; border: 1px solid #c9a84c44; color: #c9a84c; margin-top: 8px; }
        .ch-back { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #333; text-decoration: none; transition: color .2s; display: inline-block; margin-bottom: 48px; }
        .ch-back:hover { color: #c9a84c; }
        .ch-sovereign { background: linear-gradient(135deg, #0a0800 0%, #1a1200 100%); border: 1px solid #c9a84c33; border-radius: 4px; padding: 24px; margin-top: 16px; }
        .ch-sovereign-stat { text-align: center; padding: 12px; background: #000; border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '64px 32px 120px' }}>

        <Link href="/" className="ch-back">← Back to MHC Streaming</Link>

        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="ch-cinzel" style={{ fontSize: '9px', letterSpacing: '6px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '16px' }}>
            Foundational Document
          </div>
          <h1 className="ch-cinzel" style={{ fontSize: 'clamp(24px,4vw,40px)', color: '#fff', letterSpacing: '4px', marginBottom: '12px', fontWeight: 900 }}>
            THE MHC CHARTER
          </h1>
          <div className="ch-divider" style={{ marginBottom: '16px' }} />
          <p className="ch-garamond" style={{ fontSize: '18px', color: '#555', fontStyle: 'italic', marginBottom: '8px' }}>
            Charter for the Stewardship of Artistic Truth
          </p>
          <p className="ch-garamond" style={{ fontSize: '15px', color: '#333', fontStyle: 'italic' }}>
            Adopted in stewardship, not ownership.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            <span className="ch-cinzel" style={{ fontSize: '8px', letterSpacing: '2px', color: '#333', border: '1px solid #1a1a1a', padding: '4px 12px' }}>Adopted 2024</span>
            <span className="ch-cinzel" style={{ fontSize: '8px', letterSpacing: '2px', color: '#c9a84c', border: '1px solid #c9a84c33', padding: '4px 12px' }}>⚡ Amended 2026</span>
          </div>
        </div>

        <div>
          {CHARTER_ARTICLES.map((article) => (
            <div
              key={article.number}
              className={`ch-article ${activeArticle === article.number ? 'active' : ''}`}
              onClick={() => setActiveArticle(activeArticle === article.number ? null : article.number)}
            >
              <div className="ch-article-num">{article.number}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div className="ch-article-title">{article.title || 'Preamble'}</div>
                <div style={{ color: '#2a2a2a', fontSize: '18px', flexShrink: 0 }}>
                  {activeArticle === article.number ? '−' : '+'}
                </div>
              </div>
              {article.number === 'Article IV' && (
                <div className="ch-ai-badge">⚡ Updated 2026 — AI Human-First Policy & Bulk Upload Ban</div>
              )}
              {article.number === 'Article X' && (
                <div className="ch-ai-badge">⚡ Updated 2026 — Royalty Reporting Infrastructure</div>
              )}
              {article.badge && (
                <div className="ch-ai-badge">{article.badge}</div>
              )}
              {activeArticle === article.number && (
                <>
                  <p className="ch-article-content">{article.content}</p>
                  {article.number === 'Article XI' && (
                    <div className="ch-sovereign">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div className="ch-sovereign-stat">
                          <div className="ch-cinzel" style={{ fontSize: '28px', color: '#c9a84c', fontWeight: 700 }}>85%</div>
                          <div className="ch-cinzel" style={{ fontSize: '7px', letterSpacing: '2px', color: '#555', marginTop: '4px' }}>Artist Keeps</div>
                        </div>
                        <div className="ch-sovereign-stat">
                          <div className="ch-cinzel" style={{ fontSize: '28px', color: '#c9a84c', fontWeight: 700 }}>15%</div>
                          <div className="ch-cinzel" style={{ fontSize: '7px', letterSpacing: '2px', color: '#555', marginTop: '4px' }}>Admin Fee</div>
                        </div>
                        <div className="ch-sovereign-stat">
                          <div className="ch-cinzel" style={{ fontSize: '28px', color: '#c9a84c', fontWeight: 700 }}>100%</div>
                          <div className="ch-cinzel" style={{ fontSize: '7px', letterSpacing: '2px', color: '#555', marginTop: '4px' }}>You Own It</div>
                        </div>
                      </div>
                      <p className="ch-garamond" style={{ fontSize: '13px', color: '#444', fontStyle: 'italic', textAlign: 'center' }}>
                        Human-sparked. Sovereign-protected.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #0f0f0f' }}>
          <div className="ch-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '20px' }}>
            Colophon
          </div>
          <div className="ch-garamond" style={{ fontSize: '15px', color: '#444', lineHeight: 2 }}>
            <p>This document is intended for archival, legal, and continuity purposes.</p>
            <p>It may be reproduced verbatim.</p>
            <p>No derivative versions may alter its meaning or intent.</p>
          </div>
        </div>

        <div style={{ marginTop: '48px', padding: '32px', border: '1px solid #1a1a1a', background: '#080808', textAlign: 'center' }}>
          <div className="ch-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '16px' }}>
            Adoption
          </div>
          <p className="ch-garamond" style={{ fontSize: '16px', color: '#555', fontStyle: 'italic', lineHeight: 1.9 }}>
            This Charter is adopted freely, without coercion, and in full acknowledgment of its obligations.
          </p>
          <p className="ch-garamond" style={{ fontSize: '15px', color: '#333', marginTop: '12px', fontStyle: 'italic' }}>
            Signed in stewardship, not ownership.
          </p>
          <div className="ch-divider" style={{ marginTop: '24px' }} />
        </div>

      </div>
    </main>
  )
}
