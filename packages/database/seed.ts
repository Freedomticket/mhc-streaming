import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Create artist
  const artist = await prisma.artist.upsert({
    where: { slug: 'mhc-creator' },
    update: {},
    create: {
      name: 'MHC Creator',
      slug: 'mhc-creator',
      bio: 'Official MOST HIGH CREATION gallery',
      theme: 'INFERNO',
    },
  });

  console.log(`✅ Created artist: ${artist.name}`);

  // Gallery images data
  const galleryItems = [
    { title: 'Divine Vision I', description: 'Ethereal realm exploration', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_01_03 PM.png' },
    { title: 'Divine Vision II', description: 'Sacred geometry manifestation', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_07_46 PM.png' },
    { title: 'Divine Vision III', description: 'Celestial harmonics', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_11_05 PM.png' },
    { title: 'Divine Vision IV', description: 'Transcendent forms', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_13_34 PM.png' },
    { title: 'Divine Vision V', description: 'Infinite consciousness', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_13_43 PM.png' },
    { title: 'Divine Vision VI', description: 'Realm of creation', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_18_13 PM.png' },
    { title: 'Divine Vision VII', description: 'Sacred light patterns', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_20_38 PM.png' },
    { title: 'Divine Vision VIII', description: 'Cosmic architecture', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_23_30 PM.png' },
    { title: 'Divine Vision IX', description: 'Spiritual symmetry', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 01_57_45 PM.png' },
    { title: 'Divine Vision X', description: 'Divine mathematics', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_00_13 PM.png' },
    { title: 'Divine Vision XI', description: 'Higher dimensions', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_02_33 PM.png' },
    { title: 'Divine Vision XII', description: 'Angelic frequencies', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_05_55 PM.png' },
    { title: 'Divine Vision XIII', description: 'Sacred portals', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_10_40 PM.png' },
    { title: 'Divine Vision XIV', description: 'Crystalline consciousness', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_14_07 PM.png' },
    { title: 'Divine Vision XV', description: 'Eternal flame', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_14_10 PM.png' },
    { title: 'Divine Vision XVI', description: 'Quantum meditation', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_17_14 PM.png' },
    { title: 'Divine Vision XVII', description: 'Universal energy', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_22_51 PM.png' },
    { title: 'Divine Vision XVIII', description: 'Cosmic awakening', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_25_24 PM.png' },
    { title: 'Divine Vision XIX', description: 'Spiritual ascension', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_28_01 PM.png' },
    { title: 'Divine Vision XX', description: 'Divine blueprint', image: '/images/Gallery images/ChatGPT Image Dec 13, 2025, 02_31_00 PM.png' },
  ];

  // Delete existing gallery items
  await prisma.galleryItem.deleteMany({
    where: { artistId: artist.id },
  });

  // Create gallery items
  for (let i = 0; i < galleryItems.length; i++) {
    const item = galleryItems[i];
    await prisma.galleryItem.create({
      data: {
        artistId: artist.id,
        title: item.title,
        description: item.description,
        image: item.image,
        order: i + 1,
      },
    });
  }

  console.log(`✅ Created ${galleryItems.length} gallery items`);

  // Create ISM - Featured Artist for Global Distribution
  const ism = await prisma.artist.upsert({
    where: { slug: 'ism' },
    update: {},
    create: {
      name: 'ISM',
      slug: 'ism',
      bio: 'Featured artist spreading divine frequencies across the globe. ISM represents the infinite sound of creation.',
      theme: 'PARADISO',
      
      // Industry identifiers (example values - replace with real ones when available)
      iswc: 'T-123.456.789-0', // International Standard Musical Work Code
      isrc: 'USISM2500001',     // International Standard Recording Code
      ipi: '00123456789',       // Interested Party Information
      ipn: 'ISM-001',           // International Performer Number
      isni: '0000 0000 0000 0001', // International Standard Name Identifier
      
      // Featured artist settings
      tier: 'FEATURED',         // 2x multiplier on royalties
      isFeatured: true,
      featuredAt: new Date(),
      
      // Payment info (placeholder - artist will update with real details)
      paypalEmail: 'ism@mhcstreaming.com',
      minPayout: 5000, // $50 minimum
    },
  });

  console.log(`✅ Created featured artist: ${ism.name} (TIER: ${ism.tier})`);

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@mhc.com' },
    update: {},
    create: {
      email: 'demo@mhc.com',
      username: 'demo',
      displayName: 'Demo User',
      passwordHash: '$2b$10$xyz', // Placeholder - use real hash in production
      subscription: {
        create: {
          tier: 'INFERNO',
          status: 'ACTIVE',
          amount: 999,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log(`✅ Created demo user: ${user.email}`);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
