import cron from 'node-cron';
import { distributeMonthlyRevenue, autoPromoteToISM, payInfrastructureCosts } from './revenue-distribution';

/**
 * CRON SCHEDULER FOR SUSTAINABLE TREASURY SYSTEM
 * 
 * Schedules:
 * - Monthly revenue distribution (1st of month at midnight)
 * - ISM auto-promotion check (1st of month at 1am)
 * - Infrastructure cost payments (1st of month at 2am)
 */

export function startScheduler() {
  console.log('🕐 Starting treasury scheduler...');
  
  // Monthly revenue distribution - 1st of every month at midnight
  cron.schedule('0 0 1 * *', async () => {
    console.log('📅 Monthly revenue distribution starting...');
    try {
      const result = await distributeMonthlyRevenue();
      console.log('✅ Monthly distribution complete:', result);
    } catch (error) {
      console.error('❌ Monthly distribution failed:', error);
    }
  });
  
  // ISM auto-promotion - 1st of every month at 1am
  cron.schedule('0 1 1 * *', async () => {
    console.log('🌟 ISM auto-promotion check starting...');
    try {
      await autoPromoteToISM();
      console.log('✅ ISM auto-promotion complete');
    } catch (error) {
      console.error('❌ ISM auto-promotion failed:', error);
    }
  });
  
  // Pay infrastructure costs - 1st of every month at 2am
  cron.schedule('0 2 1 * *', async () => {
    console.log('💸 Paying infrastructure costs...');
    try {
      const paid = await payInfrastructureCosts();
      if (paid) {
        console.log('✅ Infrastructure costs paid automatically');
      } else {
        console.log('⚠️ Insufficient funds for infrastructure costs');
      }
    } catch (error) {
      console.error('❌ Infrastructure payment failed:', error);
    }
  });
  
  // Optional: Weekly ISM check (every Monday at noon)
  cron.schedule('0 12 * * 1', async () => {
    console.log('🔍 Weekly ISM eligibility check...');
    try {
      await autoPromoteToISM();
    } catch (error) {
      console.error('❌ Weekly ISM check failed:', error);
    }
  });
  
  console.log('✅ Treasury scheduler started successfully');
  console.log('   📆 Monthly distribution: 1st of month @ midnight');
  console.log('   🌟 ISM auto-promotion: 1st of month @ 1am');
  console.log('   💸 Infrastructure costs: 1st of month @ 2am');
  console.log('   🔍 Weekly ISM check: Mondays @ noon');
}

// Manual trigger functions for testing
export async function triggerMonthlyDistribution() {
  console.log('🧪 Manual trigger: Monthly distribution');
  return await distributeMonthlyRevenue();
}

export async function triggerIsmPromotion() {
  console.log('🧪 Manual trigger: ISM promotion');
  return await autoPromoteToISM();
}

export async function triggerInfraPayment() {
  console.log('🧪 Manual trigger: Infrastructure payment');
  return await payInfrastructureCosts();
}
