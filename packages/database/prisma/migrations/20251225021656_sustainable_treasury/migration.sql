-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'CREATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'INFERNO', 'PURGATORIO', 'PARADISO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RoyaltyType" AS ENUM ('STREAM', 'DOWNLOAD', 'SUBSCRIPTION_SHARE', 'LICENSE_REVENUE', 'ISM_PRIORITY', 'TIP', 'PREMIUM_ACCESS');

-- CreateEnum
CREATE TYPE "RoyaltyStatus" AS ENUM ('PENDING', 'CALCULATED', 'PROCESSING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "ArtistTier" AS ENUM ('EMERGING', 'RISING', 'ESTABLISHED', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "TreasuryFundType" AS ENUM ('OPERATIONS', 'ISM_PRIORITY', 'GOVERNANCE', 'AI_DEVELOPMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "twitterId" TEXT,
    "discordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "priceId" TEXT,
    "amount" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "status" "StreamStatus" NOT NULL DEFAULT 'SCHEDULED',
    "streamKey" TEXT NOT NULL,
    "rtmpUrl" TEXT,
    "hlsUrl" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "peakViewers" INTEGER NOT NULL DEFAULT 0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "requiredTier" "SubscriptionTier",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADING',
    "originalUrl" TEXT,
    "processedUrl" TEXT,
    "duration" INTEGER,
    "fileSize" INTEGER,
    "iswc" TEXT,
    "isrc" TEXT,
    "artistId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "streamCount" INTEGER NOT NULL DEFAULT 0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "requiredTier" "SubscriptionTier",
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "View" (
    "id" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "streamId" TEXT,
    "videoId" TEXT,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'INFERNO',
    "iswc" TEXT,
    "isrc" TEXT,
    "ipi" TEXT,
    "ipn" TEXT,
    "isni" TEXT,
    "tier" "ArtistTier" NOT NULL DEFAULT 'EMERGING',
    "paypalEmail" TEXT,
    "bankAccount" TEXT,
    "minPayout" INTEGER NOT NULL DEFAULT 5000,
    "totalStreams" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" INTEGER NOT NULL DEFAULT 0,
    "lifetimeRoyalties" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamEvent" (
    "id" TEXT NOT NULL,
    "videoId" TEXT,
    "streamId" TEXT,
    "artistId" TEXT NOT NULL,
    "userId" TEXT,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "revenueShare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userTier" "SubscriptionTier",
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fraudScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "StreamEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Royalty" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "streamCount" INTEGER NOT NULL DEFAULT 0,
    "totalStreams" INTEGER NOT NULL DEFAULT 0,
    "revenuePool" INTEGER NOT NULL DEFAULT 0,
    "type" "RoyaltyType" NOT NULL DEFAULT 'STREAM',
    "baseAmount" INTEGER NOT NULL DEFAULT 0,
    "tierMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "finalAmount" INTEGER NOT NULL DEFAULT 0,
    "status" "RoyaltyStatus" NOT NULL DEFAULT 'PENDING',
    "calculatedAt" TIMESTAMP(3),
    "fraudStreams" INTEGER NOT NULL DEFAULT 0,
    "adjustedAmount" INTEGER NOT NULL DEFAULT 0,
    "iswc" TEXT,
    "isrc" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Royalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyPayout" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentEmail" TEXT,
    "transactionId" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoyaltyPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyPayoutItem" (
    "id" TEXT NOT NULL,
    "royaltyId" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoyaltyPayoutItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "watchTime" INTEGER,
    "totalDuration" INTEGER,
    "completionRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "danteRealm" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedContent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReport" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ContentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationQueue" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ModerationQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamAnalytics" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "peakViewers" INTEGER NOT NULL,
    "totalViews" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseRevenue" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT,
    "tier" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "platformOps" INTEGER NOT NULL,
    "ismFund" INTEGER NOT NULL,
    "governanceFund" INTEGER NOT NULL,
    "aiFund" INTEGER NOT NULL,
    "artistPool" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "billingMonth" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseRevenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformTreasury" (
    "id" TEXT NOT NULL,
    "fundType" "TreasuryFundType" NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "totalReceived" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "month" TIMESTAMP(3) NOT NULL,
    "monthlyIncome" INTEGER NOT NULL DEFAULT 0,
    "monthlyExpense" INTEGER NOT NULL DEFAULT 0,
    "burnRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isHealthy" BOOLEAN NOT NULL DEFAULT true,
    "lastCalculated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformTreasury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryExpense" (
    "id" TEXT NOT NULL,
    "treasuryId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreasuryExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IsmPriorityArtist" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "ismVerified" BOOLEAN NOT NULL DEFAULT true,
    "priorityLevel" INTEGER NOT NULL DEFAULT 1,
    "minUploads" INTEGER NOT NULL DEFAULT 5,
    "minQuality" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "minStreams" INTEGER NOT NULL DEFAULT 1000,
    "autoPromoted" BOOLEAN NOT NULL DEFAULT false,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "pausedReason" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IsmPriorityArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueDistribution" (
    "id" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "totalRevenue" INTEGER NOT NULL DEFAULT 0,
    "platformOps" INTEGER NOT NULL DEFAULT 0,
    "ismFund" INTEGER NOT NULL DEFAULT 0,
    "governanceFund" INTEGER NOT NULL DEFAULT 0,
    "aiFund" INTEGER NOT NULL DEFAULT 0,
    "artistPool" INTEGER NOT NULL DEFAULT 0,
    "totalArtists" INTEGER NOT NULL DEFAULT 0,
    "ismArtists" INTEGER NOT NULL DEFAULT 0,
    "avgArtistShare" INTEGER NOT NULL DEFAULT 0,
    "calculated" BOOLEAN NOT NULL DEFAULT false,
    "distributed" BOOLEAN NOT NULL DEFAULT false,
    "calculatedAt" TIMESTAMP(3),
    "distributedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterId_key" ON "User"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_streamKey_key" ON "Stream"("streamKey");

-- CreateIndex
CREATE INDEX "Stream_userId_idx" ON "Stream"("userId");

-- CreateIndex
CREATE INDEX "Stream_status_idx" ON "Stream"("status");

-- CreateIndex
CREATE INDEX "Stream_scheduledFor_idx" ON "Stream"("scheduledFor");

-- CreateIndex
CREATE INDEX "Video_userId_idx" ON "Video"("userId");

-- CreateIndex
CREATE INDEX "Video_artistId_idx" ON "Video"("artistId");

-- CreateIndex
CREATE INDEX "Video_status_idx" ON "Video"("status");

-- CreateIndex
CREATE INDEX "Video_publishedAt_idx" ON "Video"("publishedAt");

-- CreateIndex
CREATE INDEX "Video_iswc_idx" ON "Video"("iswc");

-- CreateIndex
CREATE INDEX "Video_isrc_idx" ON "Video"("isrc");

-- CreateIndex
CREATE INDEX "View_userId_idx" ON "View"("userId");

-- CreateIndex
CREATE INDEX "View_streamId_idx" ON "View"("streamId");

-- CreateIndex
CREATE INDEX "View_videoId_idx" ON "View"("videoId");

-- CreateIndex
CREATE INDEX "View_createdAt_idx" ON "View"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Analytics_metric_date_idx" ON "Analytics"("metric", "date");

-- CreateIndex
CREATE INDEX "Analytics_date_idx" ON "Analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_iswc_key" ON "Artist"("iswc");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_isrc_key" ON "Artist"("isrc");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_ipi_key" ON "Artist"("ipi");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_ipn_key" ON "Artist"("ipn");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_isni_key" ON "Artist"("isni");

-- CreateIndex
CREATE INDEX "Artist_slug_idx" ON "Artist"("slug");

-- CreateIndex
CREATE INDEX "Artist_iswc_idx" ON "Artist"("iswc");

-- CreateIndex
CREATE INDEX "Artist_isrc_idx" ON "Artist"("isrc");

-- CreateIndex
CREATE INDEX "Artist_tier_idx" ON "Artist"("tier");

-- CreateIndex
CREATE INDEX "Artist_isFeatured_idx" ON "Artist"("isFeatured");

-- CreateIndex
CREATE INDEX "GalleryItem_artistId_idx" ON "GalleryItem"("artistId");

-- CreateIndex
CREATE INDEX "GalleryItem_order_idx" ON "GalleryItem"("order");

-- CreateIndex
CREATE INDEX "StreamEvent_artistId_idx" ON "StreamEvent"("artistId");

-- CreateIndex
CREATE INDEX "StreamEvent_videoId_idx" ON "StreamEvent"("videoId");

-- CreateIndex
CREATE INDEX "StreamEvent_streamId_idx" ON "StreamEvent"("streamId");

-- CreateIndex
CREATE INDEX "StreamEvent_userId_idx" ON "StreamEvent"("userId");

-- CreateIndex
CREATE INDEX "StreamEvent_timestamp_idx" ON "StreamEvent"("timestamp");

-- CreateIndex
CREATE INDEX "StreamEvent_qualified_idx" ON "StreamEvent"("qualified");

-- CreateIndex
CREATE INDEX "StreamEvent_processedAt_idx" ON "StreamEvent"("processedAt");

-- CreateIndex
CREATE INDEX "Royalty_artistId_idx" ON "Royalty"("artistId");

-- CreateIndex
CREATE INDEX "Royalty_status_idx" ON "Royalty"("status");

-- CreateIndex
CREATE INDEX "Royalty_periodStart_idx" ON "Royalty"("periodStart");

-- CreateIndex
CREATE INDEX "Royalty_periodEnd_idx" ON "Royalty"("periodEnd");

-- CreateIndex
CREATE INDEX "Royalty_calculatedAt_idx" ON "Royalty"("calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Royalty_artistId_periodStart_periodEnd_type_key" ON "Royalty"("artistId", "periodStart", "periodEnd", "type");

-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyPayout_transactionId_key" ON "RoyaltyPayout"("transactionId");

-- CreateIndex
CREATE INDEX "RoyaltyPayout_artistId_idx" ON "RoyaltyPayout"("artistId");

-- CreateIndex
CREATE INDEX "RoyaltyPayout_status_idx" ON "RoyaltyPayout"("status");

-- CreateIndex
CREATE INDEX "RoyaltyPayout_scheduledFor_idx" ON "RoyaltyPayout"("scheduledFor");

-- CreateIndex
CREATE INDEX "RoyaltyPayout_processedAt_idx" ON "RoyaltyPayout"("processedAt");

-- CreateIndex
CREATE INDEX "RoyaltyPayoutItem_royaltyId_idx" ON "RoyaltyPayoutItem"("royaltyId");

-- CreateIndex
CREATE INDEX "RoyaltyPayoutItem_payoutId_idx" ON "RoyaltyPayoutItem"("payoutId");

-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyPayoutItem_royaltyId_payoutId_key" ON "RoyaltyPayoutItem"("royaltyId", "payoutId");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_idx" ON "UserInteraction"("userId");

-- CreateIndex
CREATE INDEX "UserInteraction_contentId_idx" ON "UserInteraction"("contentId");

-- CreateIndex
CREATE INDEX "UserInteraction_action_idx" ON "UserInteraction"("action");

-- CreateIndex
CREATE INDEX "UserInteraction_createdAt_idx" ON "UserInteraction"("createdAt");

-- CreateIndex
CREATE INDEX "Content_userId_idx" ON "Content"("userId");

-- CreateIndex
CREATE INDEX "Content_category_idx" ON "Content"("category");

-- CreateIndex
CREATE INDEX "Content_isPublic_idx" ON "Content"("isPublic");

-- CreateIndex
CREATE INDEX "Content_createdAt_idx" ON "Content"("createdAt");

-- CreateIndex
CREATE INDEX "BlockedContent_type_idx" ON "BlockedContent"("type");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedContent_type_value_key" ON "BlockedContent"("type", "value");

-- CreateIndex
CREATE INDEX "ContentReport_contentId_idx" ON "ContentReport"("contentId");

-- CreateIndex
CREATE INDEX "ContentReport_reporterId_idx" ON "ContentReport"("reporterId");

-- CreateIndex
CREATE INDEX "ContentReport_status_idx" ON "ContentReport"("status");

-- CreateIndex
CREATE INDEX "ModerationQueue_contentId_idx" ON "ModerationQueue"("contentId");

-- CreateIndex
CREATE INDEX "ModerationQueue_status_idx" ON "ModerationQueue"("status");

-- CreateIndex
CREATE INDEX "ModerationQueue_priority_idx" ON "ModerationQueue"("priority");

-- CreateIndex
CREATE INDEX "StreamAnalytics_streamId_idx" ON "StreamAnalytics"("streamId");

-- CreateIndex
CREATE INDEX "StreamAnalytics_userId_idx" ON "StreamAnalytics"("userId");

-- CreateIndex
CREATE INDEX "StreamAnalytics_createdAt_idx" ON "StreamAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "LicenseRevenue_processed_idx" ON "LicenseRevenue"("processed");

-- CreateIndex
CREATE INDEX "LicenseRevenue_billingMonth_idx" ON "LicenseRevenue"("billingMonth");

-- CreateIndex
CREATE INDEX "LicenseRevenue_tier_idx" ON "LicenseRevenue"("tier");

-- CreateIndex
CREATE INDEX "LicenseRevenue_subscriptionId_idx" ON "LicenseRevenue"("subscriptionId");

-- CreateIndex
CREATE INDEX "PlatformTreasury_fundType_idx" ON "PlatformTreasury"("fundType");

-- CreateIndex
CREATE INDEX "PlatformTreasury_month_idx" ON "PlatformTreasury"("month");

-- CreateIndex
CREATE INDEX "PlatformTreasury_isHealthy_idx" ON "PlatformTreasury"("isHealthy");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformTreasury_fundType_month_key" ON "PlatformTreasury"("fundType", "month");

-- CreateIndex
CREATE INDEX "TreasuryExpense_treasuryId_idx" ON "TreasuryExpense"("treasuryId");

-- CreateIndex
CREATE INDEX "TreasuryExpense_status_idx" ON "TreasuryExpense"("status");

-- CreateIndex
CREATE INDEX "TreasuryExpense_category_idx" ON "TreasuryExpense"("category");

-- CreateIndex
CREATE INDEX "TreasuryExpense_createdAt_idx" ON "TreasuryExpense"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IsmPriorityArtist_artistId_key" ON "IsmPriorityArtist"("artistId");

-- CreateIndex
CREATE INDEX "IsmPriorityArtist_active_idx" ON "IsmPriorityArtist"("active");

-- CreateIndex
CREATE INDEX "IsmPriorityArtist_priorityLevel_idx" ON "IsmPriorityArtist"("priorityLevel");

-- CreateIndex
CREATE INDEX "IsmPriorityArtist_ismVerified_idx" ON "IsmPriorityArtist"("ismVerified");

-- CreateIndex
CREATE INDEX "IsmPriorityArtist_autoPromoted_idx" ON "IsmPriorityArtist"("autoPromoted");

-- CreateIndex
CREATE INDEX "RevenueDistribution_calculated_idx" ON "RevenueDistribution"("calculated");

-- CreateIndex
CREATE INDEX "RevenueDistribution_distributed_idx" ON "RevenueDistribution"("distributed");

-- CreateIndex
CREATE INDEX "RevenueDistribution_month_idx" ON "RevenueDistribution"("month");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueDistribution_month_key" ON "RevenueDistribution"("month");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamEvent" ADD CONSTRAINT "StreamEvent_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamEvent" ADD CONSTRAINT "StreamEvent_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamEvent" ADD CONSTRAINT "StreamEvent_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamEvent" ADD CONSTRAINT "StreamEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Royalty" ADD CONSTRAINT "Royalty_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyPayout" ADD CONSTRAINT "RoyaltyPayout_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyPayoutItem" ADD CONSTRAINT "RoyaltyPayoutItem_royaltyId_fkey" FOREIGN KEY ("royaltyId") REFERENCES "Royalty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyPayoutItem" ADD CONSTRAINT "RoyaltyPayoutItem_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "RoyaltyPayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryExpense" ADD CONSTRAINT "TreasuryExpense_treasuryId_fkey" FOREIGN KEY ("treasuryId") REFERENCES "PlatformTreasury"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsmPriorityArtist" ADD CONSTRAINT "IsmPriorityArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
