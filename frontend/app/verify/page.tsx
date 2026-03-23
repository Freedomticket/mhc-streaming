'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function VerifyPage() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', links: '', bio: '', realm: 'inferno' })

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .v-cinzel { font-family: 'Cinzel', serif; }
        .v-input { width: 100%; padding: 12px 16px; background: #080808; border: 1px solid #1a1a1a; color: #e8e0d0; font-size: 13px; outline: none; box-sizing: border-box; }
        .v-input:focus { border-color: #c9a84c44; }
        .v-btn { font-family: 'Cinzel',serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 28px; background: #c9a84c; color: #000; border: none; cursor: pointer; font-weight: 700; transition: background .2s; }
        .v-btn:hover { background: #d4b85c; }
        .v-btn-ghost { font-family: 'Cinzel',serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 28px; background: transparent; border: 1px solid #1e1e1e; color: #444; cursor: pointer; transition: all .2s; }
        .v-btn-ghost:hover { border-color: #555; color: #888; }
      `}</style>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 32px' }}>
        <div className="v-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>
          Artist Program
        </div>
        <h1 className="v-cinzel" style={{ fontSize: 'clamp(22px,3vw,32px)', color: '#fff', letterSpacing: '3px', marginBottom: '8px', textAlign: 'center' }}>
          VERIFY YOUR PROFILE
        </h1>
        <div style={{ width: '48px', height: '1px', background: 'linear-gradient(to right,transparent,#c9a84c,transparent)', margin: '0 auto 40px' }} />

        {submitted ? (
          <div style={{ background: '#0a0900', border: '1px solid #c9a84c44', padding: '40px', textAlign: 'center' }}>
            <div className="v-cinzel" style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' }}>
              Application Submitted
            </div>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.8, marginBottom: '24px' }}>
              Your verification request is under review. We typically respond within 3–5 business days. You&apos;ll receive an email when your status changes.
            </p>
            <Link href="/dashboard" className="v-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '8px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < 3 ? 1 : 'none' }}>
                  <div className="v-cinzel" style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${step >= s ? '#c9a84c' : '#1e1e1e'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: step >= s ? '#c9a84c' : '#333', flexShrink: 0 }}>
                    {s}
                  </div>
                  {s < 3 && <div style={{ flex: 1, height: '1px', background: step > s ? '#c9a84c44' : '#1a1a1a', margin: '0 8px' }} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div>
                <div className="v-cinzel" style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '24px' }}>
                  Step 1 — Your Identity
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#555', letterSpacing: '1px', marginBottom: '6px' }}>Artist / Band Name</label>
                    <input className="v-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your stage name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#555', letterSpacing: '1px', marginBottom: '6px' }}>Choose Your Realm</label>
                    <select className="v-input" value={form.realm} onChange={e => setForm(f => ({ ...f, realm: e.target.value }))} style={{ cursor: 'pointer' }}>
                      <option value="inferno">Inferno — Raw & Intense</option>
                      <option value="purgatorio">Purgatorio — Transformative</option>
                      <option value="paradiso">Paradiso — Divine & Elevated</option>
                    </select>
                  </div>
                </div>
                <button className="v-btn" onClick={() => setStep(2)}>Continue →</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="v-cinzel" style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '24px' }}>
                  Step 2 — Your Presence
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#555', letterSpacing: '1px', marginBottom: '6px' }}>Social Links / Website</label>
                    <textarea className="v-input" rows={3} value={form.links} onChange={e => setForm(f => ({ ...f, links: e.target.value }))} placeholder="Spotify, SoundCloud, Instagram, website..." style={{ resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#555', letterSpacing: '1px', marginBottom: '6px' }}>Artist Bio</label>
                    <textarea className="v-input" rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about your music and mission..." style={{ resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="v-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="v-btn" onClick={() => setStep(3)}>Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="v-cinzel" style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '24px' }}>
                  Step 3 — Review & Submit
                </div>
                <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '24px', marginBottom: '32px' }}>
                  {[
                    { label: 'Artist Name', value: form.name || '—' },
                    { label: 'Realm', value: form.realm },
                    { label: 'Links', value: form.links || '—' },
                    { label: 'Bio', value: form.bio ? form.bio.slice(0, 80) + (form.bio.length > 80 ? '...' : '') : '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', gap: '16px', padding: '10px 0', borderBottom: '1px solid #0f0f0f', fontSize: '13px' }}>
                      <span style={{ color: '#444', minWidth: '100px', flexShrink: 0 }}>{row.label}</span>
                      <span style={{ color: '#888' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="v-btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button className="v-btn" onClick={() => setSubmitted(true)}>Submit Application</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
