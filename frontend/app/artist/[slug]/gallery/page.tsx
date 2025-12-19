import { prisma } from '@/app/lib/prisma'
import { getThemeConfig, Theme } from '@/app/lib/theme'
import Link from 'next/link'

async function getData(slug: string) {
  try {
    const artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) return null
    const items = await prisma.galleryItem.findMany({ where: { artistId: artist.id }, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
    return { artist, items }
  } catch {
    return null
  }
}

export default async function ArtistGalleryPage({ params }: { params: { slug: string } }) {
  const data = await getData(params.slug)

  if (!data) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1 style={{ color: '#FFD700', fontSize: '2rem', marginBottom: 8 }}>Gallery</h1>
        <p>Artist not found or database not available. If you are setting up locally, run migrations and seed data.</p>
        <p style={{ marginTop: 8 }}>
          See the static gallery at <Link href="/gallery.html" style={{ color: '#FFD700', textDecoration: 'underline' }}>gallery.html</Link>.
        </p>
      </main>
    )
  }

  const theme = getThemeConfig(data.artist.theme as Theme)

  return (
    <main style={{ minHeight: '100vh', background: theme.colors.background }}>
      <section style={{ padding: '2rem', borderBottom: '1px solid #999' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: theme.colors.primary, fontSize: '2rem' }}>{data.artist.name}</h1>
            <p style={{ color: '#C7C7C7' }}>{data.artist.bio || 'Artist gallery'}</p>
          </div>
          <Link href={`/artist/${data.artist.slug}/settings`} style={{ padding: '0.6rem 1rem', borderRadius: 6, background: theme.colors.secondary, color: theme.colors.text }}>Edit Theme & Uploads</Link>
        </div>
      </section>

      <section style={{ padding: '2rem' }}>
        {data.items.length === 0 ? (
          <p>No gallery items yet. Use settings to upload.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, maxWidth: 1400, margin: '0 auto' }}>
            {data.items.map((it: any) => (
              <article key={it.id} style={{ borderRadius: 8, overflow: 'hidden', border: `2px solid ${theme.colors.border}`, background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ position: 'relative', width: '100%', height: 180, borderBottom: '1px solid #999' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image} alt={it.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ color: theme.colors.primary, fontSize: '1.05rem' }}>{it.title}</h3>
                  {it.description && <p style={{ color: '#C7C7C7', fontSize: 14 }}>{it.description}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
