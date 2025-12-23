-- Create enums
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'DEVELOPER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMP,
    image TEXT,
    bio TEXT,
    role "UserRole" DEFAULT 'USER',
    "isBanned" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account table
CREATE TABLE IF NOT EXISTS "Account" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, "providerAccountId")
);

-- Session table
CREATE TABLE IF NOT EXISTS "Session" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

-- Mod table
CREATE TABLE IF NOT EXISTS "Mod" (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    version TEXT NOT NULL,
    author TEXT NOT NULL,
    "authorId" TEXT REFERENCES "User"(id),
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "isSaveBreaking" BOOLEAN DEFAULT false,
    features TEXT[] DEFAULT '{}',
    "installationSteps" TEXT[] DEFAULT '{}',
    links JSONB NOT NULL,
    videos JSONB NOT NULL,
    changelog JSONB NOT NULL,
    localizations JSONB NOT NULL,
    rating FLOAT DEFAULT 0,
    "ratingCount" INTEGER DEFAULT 0,
    downloads TEXT DEFAULT '0',
    views TEXT DEFAULT '0',
    screenshots TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tag table
CREATE TABLE IF NOT EXISTS "Tag" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category TEXT NOT NULL,
    value TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    color TEXT,
    "isExternal" BOOLEAN DEFAULT false,
    UNIQUE(category, value)
);

-- ModTag junction table
CREATE TABLE IF NOT EXISTS "ModTag" (
    "modId" TEXT NOT NULL REFERENCES "Mod"(slug) ON DELETE CASCADE,
    "tagId" TEXT NOT NULL REFERENCES "Tag"(id) ON DELETE CASCADE,
    "isExternal" BOOLEAN DEFAULT false,
    "externalLink" TEXT,
    PRIMARY KEY("modId", "tagId")
);

-- News table
CREATE TABLE IF NOT EXISTS "News" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "modSlug" TEXT REFERENCES "Mod"(slug),
    "modName" TEXT,
    "modVersion" TEXT,
    "gameVersion" TEXT,
    "actionText" TEXT DEFAULT 'released',
    content TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "wipeRequired" BOOLEAN DEFAULT false,
    "sourceUrl" TEXT,
    tags JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TranslationSuggestion table
CREATE TABLE IF NOT EXISTS "TranslationSuggestion" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "modSlug" TEXT NOT NULL REFERENCES "Mod"(slug) ON DELETE CASCADE,
    "modName" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "languageName" TEXT NOT NULL,
    author TEXT NOT NULL,
    link TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ModSubmission table
CREATE TABLE IF NOT EXISTS "ModSubmission" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    version TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "isSaveBreaking" BOOLEAN DEFAULT false,
    features TEXT[] DEFAULT '{}',
    "installationSteps" TEXT[] DEFAULT '{}',
    links JSONB NOT NULL,
    videos JSONB NOT NULL,
    changelog JSONB NOT NULL,
    localizations JSONB NOT NULL,
    screenshots TEXT[] DEFAULT '{}',
    tags JSONB NOT NULL,
    "submitterId" TEXT NOT NULL REFERENCES "User"(id),
    "submitterNote" TEXT,
    status TEXT DEFAULT 'pending',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP
);

-- ViewHistory table
CREATE TABLE IF NOT EXISTS "ViewHistory" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "modSlug" TEXT NOT NULL REFERENCES "Mod"(slug) ON DELETE CASCADE,
    "viewedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "modSlug")
);

-- DownloadHistory table
CREATE TABLE IF NOT EXISTS "DownloadHistory" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "modSlug" TEXT NOT NULL REFERENCES "Mod"(slug) ON DELETE CASCADE,
    version TEXT NOT NULL,
    "downloadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    UNIQUE("userId", "modSlug", "sessionId")
);

-- Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "modSlug" TEXT NOT NULL REFERENCES "Mod"(slug) ON DELETE CASCADE,
    "subscribedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "unseenVersions" INTEGER DEFAULT 0,
    UNIQUE("userId", "modSlug")
);

-- AnonymousView table
CREATE TABLE IF NOT EXISTS "AnonymousView" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "modSlug" TEXT NOT NULL REFERENCES "Mod"(slug) ON DELETE CASCADE,
    "sessionId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("modSlug", "sessionId")
);

-- Create index
CREATE INDEX IF NOT EXISTS "AnonymousView_viewedAt_idx" ON "AnonymousView"("viewedAt");
