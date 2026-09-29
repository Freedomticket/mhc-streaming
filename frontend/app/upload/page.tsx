'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/src/lib/api'

type ContentType = 'human' | 'ai-assisted'
type Realm = 'inferno' | 'purgatorio' | 'paradiso'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [realm, setRealm] = useState<Realm>('inferno')
  const [contentType, setContentType] = useState<ContentType>('human')
  const [humanDeclaration, setHumanDeclaration] = useState(false)
  const [genres, setGenres] = useState<string[]>([])
  const [genreInput, setGenreInput] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const realmConfig = {
    inferno: { color: '#c0392b', label: 'Inferno', desc: 'Dark, intense, raw' },
    purgatorio: { color: '#888', label: 'Purgatorio', desc: 'Transformative, ascending' },
    paradiso: { color: '#c9a84c', label: 'Paradiso', desc: 'Divine, elevated, radiant' },
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('video/') && !f.type.startsWith('audio/')) {
      setError('Please select a valid video or audio file')
      return
    }
    if (f.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB')
      return
    }
    setFile(f)
    setError('')
  }

  const addGenre = () => {
    const g = genreInput.trim()
    if (g && !genres.includes(g) && genres.length < 5) {
      setGenres([...genres, g])
      setGenreInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Please select a file'); return }
    if (!title.trim()) { setError('Please enter a title'); return }
    if (!humanDeclaration) { setError('Please confirm the creator declaration to upload'); return }

    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      const { data } = await api.uploadFile(
        '/media/upload',
        file,
        { title, description, realm, contentType, genres },
        (progress) => setUploadProgress(progress)
      )
      router.push(`/watch/${data.videoId}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .up-cinzel { font-family: 'Cinzel', serif; }
        .up-input { width: 100%; padding: 12px 16px; background: #080808; border: 1px solid #1a1a1a; color: #e8e0d0; font-size: 14px; outline: none; box-sizing: border-box; transition: border-color .2s; }
        .up-input:focus { border-color: #c9a84c44; }
        .up-input::placeholder { color: #2a2a2a; }
        .up-label { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #444; display: block; margin-bottom: 8px; }
        .up-btn { padding: 14px 32px; background: #c9a84c; color: #000; border: none; font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; cursor: pointer; transition: background .2s; }
        .up-btn:hover:not(:disabled) { background: #d4b85c; }
        .up-btn:disabled { opacity: .5; cursor: not-allowed; }
        .up-error { background: #1a0500; border: 1px solid #c0392b44; color: #c0392b; padding: 12px 16px; font-size: 12px; margin-bottom: 20px; }
        .up-section { background: #080808; border: 1px solid #1a1a1a; padding: 28px; margin-bottom: 2px; }
        .up-section-title { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; margin-bottom: 20px; }
        .up-realm-btn { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 14px 16px; cursor: pointer; transition: all .2s; text-align: center; flex: 1; }
        .up-realm-btn:hover { border-color: #2a2a2a; }
        .up-type-btn { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 16px; cursor: pointer; transition: all .2s; flex: 1; }
        .up-type-btn:hover { border-color: #2a2a2a; }
        .up-dropzone { border: 1px dashed #1a1a1a; padding: 48px 24px; text-align: center; cursor: pointer; transition: border-color .2s; background: #050505; }
        .up-dropzone:hover { border-color: #c9a84c44; }
        .up-declaration { display: flex; align-items: flex-start; gap: 14px; padding: 16px; border: 1px solid #1a1a1a; background: #050505; cursor: pointer; transition: border-color .2s; }
        .up-declaration:hover { border-color: #2a2a2a; }
        .up-declaration.checked { border-color: #c9a84c44; background: #0a0900; }
        .up-genre-tag { display: inline-flex; align-items: center; gap: 6px; font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px; border: 1px solid #c9a84c44; color: #c9a84c; cursor: pointer; }
        .up-genre-tag:hover { border-color: #c0392b44; color: #c0392b; }
      `}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link href="/dashboard" style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: '#333', textDecoration: 'none', display: 'inline-block', marginBottom: '24px', transition: 'color .2s' }}
            onMouseOver={e => (e.currentTarget.style.color = '#888')}
            onMouseOut={e => (e.currentTarget.style.color = '#333')}
          >
            ← Dashboard
          </Link>
          <h1 className="up-cinzel" style={{ fontSize: 'clamp(22px,3vw,32px)', color: '#fff', letterSpacing: '3px', marginBottom: '6px' }}>
            Upload Content
          </h1>
          <div style={{ width: '48px', height: '1px', background: 'linear-gradient(to right,transparent,#c9a84c,transparent)', marginBottom: '8px' }} />
          <p style={{ fontSize: '13px', color: '#3a3a3a', letterSpacing: '1px' }}>
            Share your work with the three realms
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="up-error">{error}</div>}

          {/* File Drop */}
          <div className="up-section">
            <div className="up-section-title">Select File</div>
            <div className="up-dropzone" onClick={() => document.getElementById('file-input')?.click()}>
              <input id="file-input" type="file" accept="video/*,audio/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
              {file ? (
                <div>
                  <div className="up-cinzel" style={{ fontSize: '13px', color: '#e8e0d0', marginBottom: '6px' }}>{file.name}</div>
                  <div style={{ fontSize: '12px', color: '#444' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  {!uploading && (
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }}
                      style={{ marginTop: '12px', fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', background: 'transparent', border: '1px solid #c0392b44', color: '#c0392b', padding: '6px 14px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="up-cinzel" style={{ fontSize: '11px', letterSpacing: '2px', color: '#444', marginBottom: '8px' }}>
                    Click to select file
                  </div>
                  <div style={{ fontSize: '12px', color: '#2a2a2a' }}>
                    Video or Audio · Max 500MB · MP4, MOV, MP3, WAV, FLAC
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="up-section">
            <div className="up-section-title">Content Details</div>
            <div style={{ marginBottom: '20px' }}>
              <label className="up-label">Title *</label>
              <input className="up-input" type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your work a title" maxLength={100} disabled={uploading} />
              <div style={{ fontSize: '11px', color: '#2a2a2a', marginTop: '4px', fontFamily: 'Cinzel,serif', letterSpacing: '1px' }}>{title.length}/100</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="up-label">Description</label>
              <textarea className="up-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your work..." maxLength={1000} disabled={uploading} rows={4} style={{ resize: 'vertical' }} />
              <div style={{ fontSize: '11px', color: '#2a2a2a', marginTop: '4px', fontFamily: 'Cinzel,serif', letterSpacing: '1px' }}>{description.length}/1000</div>
            </div>
            <div>
              <label className="up-label">Genres (up to 5)</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input className="up-input" value={genreInput} onChange={e => setGenreInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGenre() } }} placeholder="e.g. Dark Ambient" style={{ flex: 1 }} />
                <button type="button" onClick={addGenre} style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', padding: '0 16px', background: 'transparent', border: '1px solid #1a1a1a', color: '#444', cursor: 'pointer' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {genres.map(g => (
                  <span key={g} className="up-genre-tag" onClick={() => setGenres(genres.filter(x => x !== g))} title="Click to remove">{g} ×</span>
                ))}
              </div>
            </div>
          </div>

          {/* Realm */}
          <div className="up-section">
            <div className="up-section-title">Choose Your Realm</div>
            <div style={{ display: 'flex', gap: '2px', background: '#111' }}>
              {(Object.entries(realmConfig) as [Realm, typeof realmConfig.inferno][]).map(([key, cfg]) => (
                <div
                  key={key}
                  className="up-realm-btn"
                  style={{ borderColor: realm === key ? cfg.color + '66' : '#1a1a1a' }}
                  onClick={() => setRealm(key)}
                >
                  <div className="up-cinzel" style={{ fontSize: '10px', letterSpacing: '2px', color: cfg.color, marginBottom: '4px' }}>{cfg.label}</div>
                  <div style={{ fontSize: '11px', color: '#444' }}>{cfg.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Type */}
          <div className="up-section">
            <div className="up-section-title">Content Type</div>
            <div style={{ display: 'flex', gap: '2px', background: '#111', marginBottom: '0' }}>
              <div
                className="up-type-btn"
                style={{ borderColor: contentType === 'human' ? '#c9a84c44' : '#1a1a1a' }}
                onClick={() => setContentType('human')}
              >
                <div className="up-cinzel" style={{ fontSize: '10px', letterSpacing: '2px', color: contentType === 'human' ? '#c9a84c' : '#444', marginBottom: '4px' }}>🎵 Human Created</div>
                <div style={{ fontSize: '11px', color: '#333' }}>100% human — no AI tools used</div>
              </div>
              <div
                className="up-type-btn"
                style={{ borderColor: contentType === 'ai-assisted' ? '#c9a84c44' : '#1a1a1a' }}
                onClick={() => setContentType('ai-assisted')}
              >
                <div className="up-cinzel" style={{ fontSize: '10px', letterSpacing: '2px', color: contentType === 'ai-assisted' ? '#c9a84c' : '#444', marginBottom: '4px' }}>⚡ AI-Assisted</div>
                <div style={{ fontSize: '11px', color: '#333' }}>Human direction + AI tools</div>
              </div>
            </div>
          </div>

          {/* Creator Declaration */}
          <div className="up-section">
            <div className="up-section-title">Creator Declaration *</div>
            <div
              className={`up-declaration ${humanDeclaration ? 'checked' : ''}`}
              onClick={() => setHumanDeclaration(d => !d)}
            >
              <input
                type="checkbox"
                checked={humanDeclaration}
                onChange={e => setHumanDeclaration(e.target.checked)}
                style={{ accentColor: '#c9a84c', marginTop: '2px', flexShrink: 0 }}
                onClick={e => e.stopPropagation()}
              />
              <div>
                <div className="up-cinzel" style={{ fontSize: '9px', letterSpacing: '2px', color: humanDeclaration ? '#c9a84c' : '#444', textTransform: 'uppercase', marginBottom: '6px' }}>
                  I confirm human creative involvement
                </div>
                <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.7 }}>
                  A human being made meaningful creative decisions in the creation of this work — including but not limited to lyrics, melody, arrangement, production, or direction. I accept full responsibility for this content under the{' '}
                  <Link href="/charter" style={{ color: '#c9a84c', textDecoration: 'none' }}>MHC Charter</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="up-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="up-cinzel" style={{ fontSize: '9px', letterSpacing: '2px', color: '#c9a84c' }}>Uploading to the realm...</span>
                <span className="up-cinzel" style={{ fontSize: '9px', color: '#c9a84c' }}>{uploadProgress}%</span>
              </div>
              <div style={{ height: '2px', background: '#111', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#c9a84c', transition: 'width .3s ease' }} />
              </div>
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button type="submit" className="up-btn" disabled={uploading || !file || !humanDeclaration}>
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload to Realm'}
            </button>
            <Link href="/dashboard" style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '14px 24px', border: '1px solid #1a1a1a', color: '#444', textDecoration: 'none', display: 'inline-block', transition: 'all .2s' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
