import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { THEME_CONFIG } from '@/app/lib/theme'

async function getArtist(slug: string) {
  try { return await prisma.artist.findUnique({ where: { slug } }) } catch { return null }
}

export default async function ArtistSettingsPage({ params }: { params: { slug: string } }) {
  const artist = await getArtist(params.slug)
  if (!artist) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1 style={{ color: '#FFD700' }}>Artist Settings</h1>
        <p>Artist not found or database not available.</p>
        <p style={{ marginTop: 8 }}>
          Use <Link href="/gallery.html" style={{ color: '#FFD700', textDecoration: 'underline' }}>static gallery</Link> while DB is being set up.
        </p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <section style={{ padding: '2rem', borderBottom: '1px solid #999' }}>
        <h1 style={{ color: '#FFD700' }}>Artist Settings: {artist.name}</h1>
        <p style={{ color: '#C7C7C7' }}>Choose your realm theme and manage your gallery.</p>
      </section>

      <section style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        {Object.entries(THEME_CONFIG).map(([key, t]) => (
          <form key={key} action={`/api/artists/${artist.slug}`} method="post" style={{ borderRadius: 8, padding: '1rem', border: `2px solid ${t.colors.border}`, background: 'rgba(0,0,0,0.35)' }}>
            <input type="hidden" name="method" value="PUT" />
            <input type="hidden" name="theme" value={key} />
            <div style={{ height: 120, borderRadius: 6, background: t.colors.background, marginBottom: 12 }} />
            <h3 style={{ color: t.colors.primary }}>{key}</h3>
            <button type="submit" style={{ marginTop: 8, padding: '0.5rem 0.8rem', borderRadius: 6, background: t.colors.secondary, color: t.colors.text, border: `1px solid ${t.colors.border}` }}>Set Theme</button>
          </form>
        ))}
      </section>

      <section style={{ padding: '2rem' }}>
        <Link href={`/artist/${artist.slug}/gallery`} style={{ color: '#FFD700', textDecoration: 'underline' }}>Back to gallery</Link>
      </section>
    </main>
  )
}
