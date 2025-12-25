import { prisma } from '@mhc/database';
import { recordLicenseRevenue, distributeMonthlyRevenue } from './revenue-distribution';
import { addMonths } from 'date-fns';

/**
 * SETUP SCRIPT
 * Creates initial ISM priority artists and tests the system
 */

export async function setupInitialIsmArtists() {
  console.log('🎨 Setting up initial ISM Priority Artists...\n');
  
  // Get all artists (you'll need to manually select which ones are ISM)
  const artists = await prisma.artist.findMany({
    orderBy: { totalStreams: 'desc' },
    take: 10,
  });
  
  if (artists.length === 0) {
    console.log('⚠️  No artists found. Create artists first!');
    return;
  }
  
  console.log(`Found ${artists.length} artists. Top artists by streams:\n`);
  artists.forEach((artist, i) => {
    console.log(`${i + 1}. ${artist.name} - ${artist.totalStreams} streams, Tier: ${artist.tier}`);
  });
  
  // Example: Designate top 3 artists as ISM Priority
  console.log('\n📝 Designating top 3 artists as ISM Priority...\n');
  
  for (let i = 0; i < Math.min(3, artists.length); i++) {
    const artist = artists[i];
    
    try {
      const ism = await prisma.ismPriorityArtist.create({
        data: {
          artistId: artist.id,
          priorityLevel: 5 - i, // Level 5, 4, 3 for top 3
          ismVerified: true,
          manualOverride: true,
          active: true,
          minUploads: 0,
          minQuality: 0,
          minStreams: 0,
        },
      });
      
      console.log(`✅ ${artist.name} → ISM Priority Level ${ism.priorityLevel}`);
    } catch (error:any) {
      if (error.code === 'P2002') {
        console.log(`ℹ️  ${artist.name} already ISM Priority`);
      } else {
        console.error(`❌ Error adding ${artist.name}:`, error.message);
      }
    }
  }
  
  console.log('\n✅ ISM setup complete!\n');
}

/**
 * Test the revenue distribution system with demo data
 */
export async function testRevenueSystem() {
  console.log('🧪 Testing Revenue Distribution System...\n');
  
  // 1. Record some test license purchases
  console.log('📊 Recording test license revenues:\n');
  
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = addMonths(periodStart, 1);
  
  // Record 2 Basic licenses ($99 each)
  await recordLicenseRevenue({
    subscriptionId: 'test_sub_basic_1',
    tier: 'Basic',
    amount: 9900, // $99
    periodStart,
    periodEnd,
  });
  
  await recordLicenseRevenue({
    subscriptionId: 'test_sub_basic_2',
    tier: 'Basic',
    amount: 9900, // $99
    periodStart,
    periodEnd,
  });
  
  // Record 1 Pro license ($499)
  await recordLicenseRevenue({
    subscriptionId: 'test_sub_pro_1',
    tier: 'Pro',
    amount: 49900, // $499
    periodStart,
    periodEnd,
  });
  
  console.log('\n💰 Total test revenue: $697\n');
  console.log('   Platform Operations: $209.10 (30%)');
  console.log('   ISM Priority Fund: $69.70 (10%)');
  console.log('   Governance: $34.85 (5%)');
  console.log('   AI Development: $34.85 (5%)');
  console.log('   Artist Pool: $348.50 (50%)\n');
  
  // 2. Run distribution
  console.log('🚀 Running distribution...\n');
  const result = await distributeMonthlyRevenue(now);
  
  console.log('\n✅ Test complete!');
  console.log(`   Revenue distributed: $${result.totalRevenue / 100}`);
  console.log(`   Artists received payment: ${result.artistsReceived}`);
  console.log(`   ISM Artists received payment: ${result.ismArtistsReceived}\n`);
  
  // 3. Show treasury balances
  console.log('💵 Treasury Balances:');
  const treasuries = await prisma.platformTreasury.findMany({
    where: { month: periodStart },
  });
  
  treasuries.forEach((t) => {
    console.log(`   ${t.fundType}: $${t.balance / 100}`);
  });
  
  console.log('\n');
}

/**
 * View ISM Priority Artists
 */
export async function viewIsmArtists() {
  const ismArtists = await prisma.ismPriorityArtist.findMany({
    include: { artist: true },
    orderBy: { priorityLevel: 'desc' },
  });
  
  console.log('\n🌟 ISM Priority Artists:\n');
  if (ismArtists.length === 0) {
    console.log('   No ISM artists yet. Run setupInitialIsmArtists() first.\n');
    return;
  }
  
  ismArtists.forEach((ism) => {
    const status = ism.active ? '✅' : '⏸️';
    const auto = ism.autoPromoted ? '🤖' : '👤';
    console.log(`   ${status} ${auto} Level ${ism.priorityLevel}: ${ism.artist.name}`);
  });
  console.log('\n');
}

// Run if called directly
if (require.main === module) {
  (async () => {
    console.log('🔧 MHC Streaming - ISM Setup & Testing\n');
    console.log('=====================================\n');
    
    await setupInitialIsmArtists();
    await viewIsmArtists();
    await testRevenueSystem();
    
    await prisma.$disconnect();
  })();
}
