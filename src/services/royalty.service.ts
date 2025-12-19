/**
 * Global Royalties Payout Automation Service
 * Ensures automatic artist payouts with forensic audit trail
 *
 * Features:
 * - Automatic royalty crediting (views, subscriptions, tips, collaborations)
 * - Monthly payout automation
 * - Region-aware tax handling
 * - Collaborator percentage splits
 * - Multiple payout methods (Stripe, bank, crypto, manual)
 * - Every transaction forensically logged
 *
 * Integrates with: Stripe, Forensics, Database
 */

import { prisma } from '../prisma';
import { logForensicEvent } from './forensics.service';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export interface RoyaltyRate {
  source: string;
  ratePercent: number;
  description: string;
}

export interface TaxRule {
  country: string;
  rate: number;
  threshold: number;
}

// Default royalty rates per source
export const ROYALTY_RATES: Record<string, RoyaltyRate> = {
  video_view: { source: 'video_view', ratePercent: 0.01, description: 'Per video view' },
  patron_monthly: {
    source: 'patron_monthly',
    ratePercent: 70,
    description: 'Monthly patron subscription (70% to artist)',
  },
  livestream_tip: {
    source: 'livestream_tip',
    ratePercent: 90,
    description: 'Livestream tip (90% to artist)',
  },
  collaboration: {
    source: 'collaboration',
    ratePercent: 50,
    description: 'Collaboration revenue split',
  },
  music_distribution: {
    source: 'music_distribution',
    ratePercent: 85,
    description: 'Music label distribution (85% to artist)',
  },
  playlist_share: {
    source: 'playlist_share',
    ratePercent: 100,
    description: 'Playlist revenue share',
  },
};

// Tax rates by country
export const TAX_RULES: TaxRule[] = [
  { country: 'US', rate: 24, threshold: 600 }, // 1099-NEC
  { country: 'CA', rate: 20, threshold: 0 }, // 15% GST + 5% income
  { country: 'GB', rate: 20, threshold: 85000 }, // VAT + income tax
  { country: 'AU', rate: 47, threshold: 0 }, // Income tax
];

export class RoyaltyService {
  /**
   * Credit royalties to artist account
   * Called every time revenue is generated
   */
  async creditRoyalty(
    userId: string,
    amountCents: number,
    source: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      // Validate rate exists
      const rateInfo = ROYALTY_RATES[source];
      if (!rateInfo) {
        throw new Error(`Unknown royalty source: ${source}`);
      }

      // Get or create royalty account
      let account = await prisma.royaltyAccount.findUnique({
        where: { userId },
      });

      if (!account) {
        account = await prisma.royaltyAccount.create({
          data: {
            userId,
            balance: 0,
            totalEarned: 0,
            totalPaidOut: 0,
          },
        });
      }

      // Create transaction record
      const transaction = await prisma.royaltyTransaction.create({
        data: {
          accountId: account.id,
          amount: amountCents,
          source,
          status: 'credited',
          metadata,
          transactionHash: this.generateTransactionHash(account.id, amountCents),
          createdAt: new Date(),
        },
      });

      // Update account balance
      await prisma.royaltyAccount.update({
        where: { id: account.id },
        data: {
          balance: { increment: amountCents },
          totalEarned: { increment: amountCents },
        },
      });

      // Log to forensics
      await logForensicEvent(
        'ROYALTY_CREDITED',
        'royaltyTransaction',
        transaction.id,
        userId,
        {
          amount: amountCents,
          source,
          rate: rateInfo.ratePercent,
          ...metadata,
        }
      );

      return transaction.id;
    } catch (error) {
      throw new Error(`Failed to credit royalty: ${(error as Error).message}`);
    }
  }

  /**
   * Process automatic monthly payouts
   * Run via cron job: 0 0 1 * * (1st of every month)
   */
  async processMonthlyPayouts(): Promise<{
    success: number;
    failed: number;
    total: number;
  }> {
    let success = 0;
    let failed = 0;

    try {
      // Get all accounts with balance >= $50
      const accounts = await prisma.royaltyAccount.findMany({
        where: {
          balance: { gte: 5000 }, // $50 minimum
        },
        include: { user: true },
      });

      for (const account of accounts) {
        try {
          await this.processAccountPayout(account);
          success++;
        } catch (error) {
          console.error(`Payout failed for ${account.userId}:`, error);
          failed++;
        }
      }

      // Log summary
      await logForensicEvent(
        'MONTHLY_PAYOUTS_PROCESSED',
        'payoutBatch',
        crypto.randomUUID(),
        'system',
        {
          success,
          failed,
          total: accounts.length,
          timestamp: new Date(),
        }
      );

      return { success, failed, total: accounts.length };
    } catch (error) {
      throw new Error(`Monthly payout processing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Process payout for individual account
   */
  private async processAccountPayout(account: any): Promise<void> {
    const user = account.user;

    // Determine payout method (in priority order)
    if (user.stripeConnectAccountId) {
      await this.payoutViaStriped(account, user);
    } else if (user.bankAccountIban) {
      await this.payoutViaBankTransfer(account, user);
    } else if (user.cryptoWallet) {
      await this.payoutVioCrypto(account, user);
    } else {
      // No verified payout method, create manual invoice
      await this.createManualInvoice(account, user);
    }
  }

  /**
   * Payout via Stripe Connect
   */
  private async payoutViaStriped(account: any, user: any): Promise<void> {
    try {
      // Calculate taxes
      const { netAmount, taxAmount } = this.calculateTaxes(
        account.balance,
        user.country
      );

      // Create payout
      const payout = await stripe.payouts.create({
        amount: netAmount,
        currency: 'usd',
        destination: user.stripeConnectAccountId,
      });

      // Create payout record
      const payoutRecord = await prisma.payout.create({
        data: {
          accountId: account.id,
          method: 'stripe_connect',
          amountCents: netAmount,
          taxCents: taxAmount,
          grossCents: account.balance,
          status: 'completed',
          externalId: payout.id,
          processedAt: new Date(),
        },
      });

      // Reset account balance
      await prisma.royaltyAccount.update({
        where: { id: account.id },
        data: {
          balance: 0,
          totalPaidOut: { increment: netAmount },
        },
      });

      // Log to forensics
      await logForensicEvent(
        'PAYOUT_COMPLETED',
        'payout',
        payoutRecord.id,
        user.id,
        {
          method: 'stripe_connect',
          gross: account.balance,
          net: netAmount,
          tax: taxAmount,
          stripePayoutId: payout.id,
        }
      );
    } catch (error) {
      throw new Error(
        `Stripe payout failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Payout via bank transfer
   */
  private async payoutViaBankTransfer(account: any, user: any): Promise<void> {
    try {
      const { netAmount, taxAmount } = this.calculateTaxes(
        account.balance,
        user.country
      );

      // Create bank payout record
      const payoutRecord = await prisma.payout.create({
        data: {
          accountId: account.id,
          method: 'bank_transfer',
          amountCents: netAmount,
          taxCents: taxAmount,
          grossCents: account.balance,
          status: 'pending',
          bankIban: user.bankAccountIban,
          bankName: user.bankAccountName,
          processedAt: new Date(),
        },
      });

      // Reset account balance
      await prisma.royaltyAccount.update({
        where: { id: account.id },
        data: { balance: 0 },
      });

      // Log to forensics
      await logForensicEvent(
        'PAYOUT_INITIATED',
        'payout',
        payoutRecord.id,
        user.id,
        {
          method: 'bank_transfer',
          gross: account.balance,
          net: netAmount,
          tax: taxAmount,
        }
      );
    } catch (error) {
      throw new Error(`Bank payout failed: ${(error as Error).message}`);
    }
  }

  /**
   * Payout via cryptocurrency (Ethereum, Polygon, Bitcoin)
   */
  private async payoutVioCrypto(account: any, user: any): Promise<void> {
    try {
      const { netAmount, taxAmount } = this.calculateTaxes(
        account.balance,
        user.country
      );

      // Convert cents to crypto equivalent
      // This would integrate with your crypto payment processor
      const cryptoAmount = await this.convertToCrypto(netAmount, user.cryptoType || 'ETH');

      const payoutRecord = await prisma.payout.create({
        data: {
          accountId: account.id,
          method: 'crypto',
          amountCents: netAmount,
          taxCents: taxAmount,
          grossCents: account.balance,
          status: 'pending',
          cryptoAddress: user.cryptoWallet,
          cryptoType: user.cryptoType || 'ETH',
          cryptoAmount: cryptoAmount.toString(),
          processedAt: new Date(),
        },
      });

      // Reset account balance
      await prisma.royaltyAccount.update({
        where: { id: account.id },
        data: { balance: 0 },
      });

      // Log to forensics
      await logForensicEvent(
        'PAYOUT_INITIATED',
        'payout',
        payoutRecord.id,
        user.id,
        {
          method: 'crypto',
          gross: account.balance,
          net: netAmount,
          tax: taxAmount,
          cryptoType: user.cryptoType,
          cryptoAmount,
        }
      );
    } catch (error) {
      throw new Error(`Crypto payout failed: ${(error as Error).message}`);
    }
  }

  /**
   * Create manual payout invoice
   */
  private async createManualInvoice(account: any, user: any): Promise<void> {
    try {
      const { netAmount, taxAmount } = this.calculateTaxes(
        account.balance,
        user.country
      );

      const invoice = await prisma.payout.create({
        data: {
          accountId: account.id,
          method: 'manual_invoice',
          amountCents: netAmount,
          taxCents: taxAmount,
          grossCents: account.balance,
          status: 'pending',
          processedAt: new Date(),
        },
      });

      // Reset account balance
      await prisma.royaltyAccount.update({
        where: { id: account.id },
        data: { balance: 0 },
      });

      // Log to forensics
      await logForensicEvent(
        'PAYOUT_MANUAL_INVOICE',
        'payout',
        invoice.id,
        user.id,
        {
          method: 'manual_invoice',
          gross: account.balance,
          net: netAmount,
          tax: taxAmount,
        }
      );
    } catch (error) {
      throw new Error(`Manual invoice creation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate taxes based on country
   */
  private calculateTaxes(amountCents: number, country: string): {
    netAmount: number;
    taxAmount: number;
  } {
    const taxRule = TAX_RULES.find((r) => r.country === country);
    if (!taxRule) {
      // Default: no tax
      return { netAmount: amountCents, taxAmount: 0 };
    }

    // Only apply tax if above threshold
    if (amountCents < taxRule.threshold * 100) {
      return { netAmount: amountCents, taxAmount: 0 };
    }

    const taxAmount = Math.round(amountCents * (taxRule.rate / 100));
    return {
      netAmount: amountCents - taxAmount,
      taxAmount,
    };
  }

  /**
   * Get account balance and history
   */
  async getAccountSummary(userId: string): Promise<any> {
    try {
      const account = await prisma.royaltyAccount.findUnique({
        where: { userId },
      });

      if (!account) {
        return {
          balance: 0,
          totalEarned: 0,
          totalPaidOut: 0,
          transactions: [],
        };
      }

      const transactions = await prisma.royaltyTransaction.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return {
        balance: account.balance,
        totalEarned: account.totalEarned,
        totalPaidOut: account.totalPaidOut,
        transactions,
      };
    } catch (error) {
      throw new Error(`Failed to fetch account summary: ${(error as Error).message}`);
    }
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(userId: string, months: number = 12): Promise<any[]> {
    try {
      const account = await prisma.royaltyAccount.findUnique({
        where: { userId },
      });

      if (!account) return [];

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      return await prisma.payout.findMany({
        where: {
          accountId: account.id,
          processedAt: { gte: startDate },
        },
        orderBy: { processedAt: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to fetch payout history: ${(error as Error).message}`);
    }
  }

  /**
   * Get collaborator split for a video
   */
  async applyCollaboratorSplit(
    videoId: string,
    totalRevenue: number,
    collaborators: Array<{ userId: string; percentage: number }>
  ): Promise<void> {
    try {
      for (const collab of collaborators) {
        const collabAmount = Math.round(totalRevenue * (collab.percentage / 100));
        await this.creditRoyalty(collab.userId, collabAmount, 'collaboration', {
          videoId,
          percentage: collab.percentage,
        });
      }

      // Log to forensics
      await logForensicEvent(
        'COLLABORATOR_SPLIT_APPLIED',
        'video',
        videoId,
        'system',
        {
          totalRevenue,
          collaborators: collaborators.map((c) => ({
            userId: c.userId,
            percentage: c.percentage,
            amount: Math.round(totalRevenue * (c.percentage / 100)),
          })),
        }
      );
    } catch (error) {
      throw new Error(`Collaborator split failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate transaction hash for audit trail
   */
  private generateTransactionHash(accountId: string, amount: number): string {
    return crypto
      .createHash('sha256')
      .update(`${accountId}:${amount}:${Date.now()}`)
      .digest('hex');
  }

  /**
   * Convert USD cents to crypto
   */
  private async convertToCrypto(
    amountCents: number,
    cryptoType: string
  ): Promise<number> {
    // This would call a real exchange rate API
    // For now, return mock conversion
    const exchangeRates: Record<string, number> = {
      ETH: 1800, // $1800 per ETH
      BTC: 45000, // $45000 per BTC
      USDC: 1, // 1:1 for stablecoins
    };

    const rate = exchangeRates[cryptoType] || 1;
    return (amountCents / 100) / rate;
  }
}

export const royaltyService = new RoyaltyService();

/**
 * Export creditRoyalty as standalone function for convenience
 */
export async function creditRoyalty(
  userId: string,
  amountCents: number,
  source: string,
  metadata?: Record<string, any>
): Promise<string> {
  return royaltyService.creditRoyalty(userId, amountCents, source, metadata);
}
