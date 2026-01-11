-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'DEVELOPER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mod" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorId" TEXT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "isSaveBreaking" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT[],
    "installationSteps" TEXT[],
    "links" JSONB NOT NULL,
    "videos" JSONB NOT NULL,
    "changelog" JSONB NOT NULL,
    "localizations" JSONB NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "downloads" TEXT NOT NULL DEFAULT '0',
    "views" TEXT NOT NULL DEFAULT '0',
    "downloadsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "screenshots" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mod_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModTag" (
    "modId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "externalLink" TEXT,

    CONSTRAINT "ModTag_pkey" PRIMARY KEY ("modId","tagId")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "modSlug" TEXT,
    "modName" TEXT,
    "modVersion" TEXT,
    "gameVersion" TEXT,
    "actionText" TEXT NOT NULL DEFAULT 'released',
    "content" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wipeRequired" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "newscatTagId" TEXT,
    "gameVersionTagId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationSuggestion" (
    "id" TEXT NOT NULL,
    "modSlug" TEXT NOT NULL,
    "modName" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "languageName" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModSubmission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "isSaveBreaking" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT[],
    "installationSteps" TEXT[],
    "links" JSONB NOT NULL,
    "videos" JSONB NOT NULL,
    "changelog" JSONB NOT NULL,
    "localizations" JSONB NOT NULL,
    "screenshots" TEXT[],
    "tags" JSONB NOT NULL,
    "submitterId" TEXT NOT NULL,
    "submitterNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ModSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modSlug" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modSlug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "DownloadHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modSlug" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unseenVersions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnonymousView" (
    "id" TEXT NOT NULL,
    "modSlug" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnonymousDownload" (
    "id" TEXT NOT NULL,
    "modSlug" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSocialLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "UserSocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL,
    "viewerId" TEXT,
    "viewedId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_category_value_key" ON "Tag"("category", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ModSubmission_slug_key" ON "ModSubmission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ViewHistory_userId_modSlug_key" ON "ViewHistory"("userId", "modSlug");

-- CreateIndex
CREATE UNIQUE INDEX "DownloadHistory_userId_modSlug_sessionId_key" ON "DownloadHistory"("userId", "modSlug", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_modSlug_key" ON "Subscription"("userId", "modSlug");

-- CreateIndex
CREATE INDEX "AnonymousView_viewedAt_idx" ON "AnonymousView"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousView_modSlug_ipAddress_key" ON "AnonymousView"("modSlug", "ipAddress");

-- CreateIndex
CREATE INDEX "AnonymousDownload_downloadedAt_idx" ON "AnonymousDownload"("downloadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousDownload_modSlug_ipAddress_key" ON "AnonymousDownload"("modSlug", "ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSocialLink_userId_platform_key" ON "UserSocialLink"("userId", "platform");

-- CreateIndex
CREATE INDEX "ProfileView_viewedId_viewedAt_idx" ON "ProfileView"("viewedId", "viewedAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mod" ADD CONSTRAINT "Mod_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModTag" ADD CONSTRAINT "ModTag_modId_fkey" FOREIGN KEY ("modId") REFERENCES "Mod"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModTag" ADD CONSTRAINT "ModTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES "Mod"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationSuggestion" ADD CONSTRAINT "TranslationSuggestion_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES "Mod"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModSubmission" ADD CONSTRAINT "ModSubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewHistory" ADD CONSTRAINT "ViewHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewHistory" ADD CONSTRAINT "ViewHistory_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES "Mod"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES "Mod"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES "Mod"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousView" ADD CONSTRAINT "AnonymousView_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES "Mod"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousDownload" ADD CONSTRAINT "AnonymousDownload_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES "Mod"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSocialLink" ADD CONSTRAINT "UserSocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewedId_fkey" FOREIGN KEY ("viewedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

