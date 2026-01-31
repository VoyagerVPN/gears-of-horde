# 🗺️ AI Project Map: Gears of Horde

> **Purpose**: Navigation index for AI agents working on this codebase  
> **Project**: Gears of Horde - Mod platform for 7 Days to Die  
> **Stack**: Next.js 16 + React 19 + TypeScript + Prisma + PostgreSQL + next-intl  

---

## 📍 Quick Orientation

```
┌─────────────────────────────────────────────────────────────────┐
│  PROJECT ARCHITECTURE                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Pages     │───→│   Actions   │───→│    DB       │         │
│  │  (App Router)│    │  (Server)   │    │  (Prisma)   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         ↑                                    ↑                  │
│         └─────────────┬──────────────────────┘                  │
│                       ↓                                         │
│              ┌─────────────┐                                    │
│              │  Schemas    │  (Zod validation)                  │
│              └─────────────┘                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Critical Entry Points

### Auth Flow
| File | Purpose |
|------|---------|
| `src/auth.ts` | NextAuth v5 config, Discord OAuth only |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth API endpoint |
| `src/types/next-auth.d.ts` | Session type extensions (role, id) |

### Database
| File | Purpose |
|------|---------|
| `src/lib/db.ts` | Prisma client singleton with pg adapter |
| `prisma/schema.prisma` | Full schema definition |

### Routing & i18n
| File | Purpose |
|------|---------|
| `src/i18n/routing.ts` | Locale config: `en` (default), `ru` |
| `src/lib/routes.ts` | Route constants for revalidatePath |
| `src/app/[locale]/` | All pages under locale prefix |

---

## 🧠 Domain Knowledge

### Core Entities
```typescript
// Mod (Primary entity)
interface Mod {
  slug: string;              // Primary key
  title: string;
  version: string;
  author: string;            // Display name (legacy)
  authorId?: string;         // Link to User
  description: string;
  status: 'active' | 'on_hold' | 'discontinued' | 'upcoming' | 'unknown';
  gameVersion: string;       // Normalized format: V1.0, A21
  bannerUrl?: string;
  isSaveBreaking: boolean;
  features: string[];
  installationSteps: string[];
  links: ModLinks;           // JSON field
  videos: ModVideos;         // JSON field
  changelog: ModChangelog[]; // JSON field
  localizations: ModLocalization[]; // JSON field
  screenshots: string[];
  tags: ModTag[];            // Many-to-many via ModTag
}

// Tag System (Category-based)
interface Tag {
  id: string;
  category: 'gamever' | 'author' | 'lang' | 'status' | 'newscat' | 'tag';
  value: string;             // Normalized (lowercase, underscores)
  displayName: string;       // Human-readable
  color?: string;
}

// User Roles
enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator', 
  DEVELOPER = 'developer',
  ADMIN = 'admin'
}
```

### Tag Categories Reference
| Category | Purpose | Examples |
|----------|---------|----------|
| `gamever` | Game version | `1_0`, `a21` |
| `author` | Mod author | `khaine`, `snufkin` |
| `lang` | Supported language | `english`, `russian` |
| `status` | Mod status | `active`, `on_hold` |
| `newscat` | News category | `new`, `update`, `release` |
| `tag` | Generic feature tags | `survival`, `weapons` |

---

## 📁 File Structure Index

### App Router (`src/app/[locale]/`)
```
[locale]/
├── page.tsx                    # Home page
├── layout.tsx                  # Root layout with Providers
├── error.tsx                   # Error boundary
├── not-found.tsx               # 404 page
│
├── mods/
│   ├── page.tsx               # Mods listing (server)
│   ├── ModsClient.tsx         # Client filtering/sorting
│   └── [slug]/
│       └── page.tsx           # Individual mod page
│
├── news/
│   ├── page.tsx               # News listing
│   └── NewsPageClient.tsx     # Client-side news UI
│
├── author/
│   └── page.tsx               # Author showcase page
│
├── search/
│   └── page.tsx               # Global search
│
├── profile/
│   ├── layout.tsx             # Profile shell
│   ├── page.tsx               # Profile overview
│   ├── downloads/             # Download history
│   ├── history/               # View history
│   ├── my-mods/               # User's mods
│   └── subscriptions/         # Subscribed mods
│
├── editor/
│   ├── layout.tsx             # Editor shell
│   ├── page.tsx               # Editor home
│   └── [slug]/
│       └── page.tsx           # Edit existing mod
│
├── admin/                     # Admin-only routes
│   ├── layout.tsx             # Admin shell
│   ├── page.tsx               # Admin dashboard
│   ├── mods/                  # Mod management
│   ├── news/                  # News management
│   ├── tags/                  # Tag management
│   ├── users/                 # User management
│   └── settings/              # Site settings
│
├── faq/                       # FAQ page
├── privacy/                   # Privacy policy
└── terms/                     # Terms of service
```

### Server Actions (`src/app/actions/`)
```
actions/
├── mod-actions.ts            # CRUD for Mods
├── mod-submission-actions.ts # Handle submissions
├── news-actions.ts           # News CRUD
├── tag-actions.ts            # Tag management
├── user-actions.ts           # User management
├── profile-actions.ts        # Profile operations
├── admin-actions.ts          # Admin utilities
├── search-actions.ts         # Search functionality
├── stats-actions.ts          # Statistics/analytics
├── language-actions.ts       # Localization actions
├── translation-actions.ts    # Translation suggestions
└── sync-tags.ts              # Tag sync utilities
```

### Components (`src/components/`)
```
components/
├── mod/                      # Mod-specific components
│   ├── UnifiedModLayout.tsx  # Main mod display
│   ├── VisualModEditor.tsx   # Mod editor form
│   ├── ModHeader.tsx
│   ├── ModAboutSection.tsx
│   ├── MediaGallery.tsx
│   ├── FeatureList.tsx
│   ├── InstallationAccordion.tsx
│   ├── FeedbackSection.tsx
│   ├── EditableChangelog.tsx
│   ├── EditableLanguageTags.tsx
│   ├── SuggestTranslationModal.tsx
│   ├── UnifiedUpdateModal.tsx
│   ├── ViewModeActions.tsx
│   ├── AuthPopover.tsx
│   └── DraftHistoryModal.tsx
│
├── profile/                  # Profile components
│   ├── ProfileOverview.tsx
│   ├── ProfileAvatarCard.tsx
│   ├── ProfileBioCard.tsx
│   ├── ProfileStatsGrid.tsx
│   ├── ProfileActivityFeed.tsx
│   ├── ProfileBadgesCard.tsx
│   ├── ProfileSocialLinks.tsx
│   └── ProfileBottomNav.tsx
│
├── news/                     # News components
│   └── NewsFilter.tsx
│
├── tags/                     # Tag management UI
│   ├── TagModal.tsx
│   ├── CategoryEditModal.tsx
│   ├── MergeTagModal.tsx
│   └── MergeCategoryModal.tsx
│
├── admin/
│   └── AdminCharts.tsx       # Analytics charts
│
├── ui/                       # Shared UI components
│   ├── Button.tsx
│   ├── Dialog.tsx
│   ├── Popover.tsx
│   ├── Tooltip.tsx
│   ├── Toast.tsx
│   ├── SearchBar.tsx
│   ├── RichTextEditor.tsx    # TipTap editor
│   ├── ScreenshotDropzone.tsx
│   ├── BannerUpload.tsx
│   ├── ImageCropModal.tsx
│   ├── DatePicker.tsx
│   ├── GameVersionSelector.tsx
│   ├── Tag.tsx
│   ├── SectionHeader.tsx
│   ├── SidebarNav.tsx
│   ├── UnifiedTopBar.tsx
│   └── EditorSubNav.tsx
│
├── layouts/
│   └── DashboardLayout.tsx
│
├── Navbar.tsx
├── HeroSection.tsx
├── ModCard.tsx
├── ModSection.tsx
├── NewsCard.tsx
├── SortToolbar.tsx
├── AuthButton.tsx
├── LanguageSwitcher.tsx
├── TagSelector.tsx
├── ImageViewer.tsx
├── DateDisplay.tsx
├── AuthorTag.tsx
├── VersionTag.tsx
├── SkipLink.tsx
└── Providers.tsx
```

### Utilities (`src/lib/`)
```
lib/
├── db.ts                     # Prisma client instance
├── config.ts                 # App configuration
├── routes.ts                 # Route constants
├── utils.ts                  # General utilities
├── mod-utils.ts              # Mod data transformations
├── tag-utils.ts              # Tag CRUD helpers
├── tag-colors.ts             # Tag color definitions
├── tags.ts                   # Tag constants
├── mod-constants.ts          # Mod-related constants
├── dateUtils.ts              # Date formatting
├── cropImage.ts              # Image cropping
├── imageCompression.ts       # Image optimization
├── design-tokens.ts          # UI design tokens
└── result.ts                 # Result<T,E> pattern
```

### Schemas (`src/schemas/`)
```
schemas/
├── index.ts                  # Centralized exports
├── mod.schema.ts             # Mod Zod schemas
├── news.schema.ts            # News Zod schemas
├── submission.schema.ts      # Submission schemas
├── tag.schema.ts             # Tag management schemas
└── profile.schema.ts         # Profile schemas
```

### Hooks (`src/hooks/`)
```
hooks/
├── useAutosave.ts            # Auto-save functionality
├── useFormValidation.ts      # Form validation hook
└── useRecentMods.ts          # Recent mods tracking
```

### Types (`src/types/`)
```
types/
├── mod.ts                    # Mod type definitions
├── database.ts               # Database types
└── next-auth.d.ts            # Auth type extensions
```

---

## 🎯 Common Patterns

### Server Action Pattern
```typescript
'use server';

import { db as prisma } from "@/lib/db";
import { SomeSchema } from "@/schemas";
import { validate, ok, err, type Result } from "@/lib/result";
import { revalidatePath } from "next/cache";

export async function someAction(data: unknown): Promise<Result<SomeType>> {
    // 1. Validate input
    const validated = validate(SomeSchema, data);
    if (!validated.success) return validated;
    
    try {
        // 2. Database operation
        const result = await prisma.someModel.create({
            data: validated.data
        });
        
        // 3. Revalidate affected paths
        revalidatePath('/some-path');
        
        return ok(result);
    } catch (error) {
        return err(error instanceof Error ? error.message : "Unknown");
    }
}
```

### Result Pattern (from `src/lib/result.ts`)
```typescript
import { ok, err, type Result } from "@/lib/result";

// Success: { success: true, data: T }
// Error:   { success: false, error: string }

function doSomething(): Result<string> {
    if (Math.random() > 0.5) {
        return ok("success");
    }
    return err("something went wrong");
}
```

### Tag Creation Pattern
```typescript
import { 
    findOrCreateAuthorTag,
    findOrCreateGameVerTag, 
    findOrCreateLangTag,
    findOrCreateGenericTag,
    linkTagToMod 
} from "@/lib/tag-utils";

// Always use these helpers - they handle normalization
const authorTag = await findOrCreateAuthorTag("Author Name");
const gameVerTag = await findOrCreateGameVerTag("V1.0");
await linkTagToMod(modSlug, authorTag.id);
```

### Auth Check Pattern
```typescript
import { auth } from "@/auth";

export async function protectedAction() {
    const session = await auth();
    if (!session?.user) {
        return err("Unauthorized");
    }
    // Check role if needed
    if (session.user.role !== 'admin') {
        return err("Forbidden");
    }
    // ... action logic
}
```

---

## 🚨 Critical Constraints

### Mod Schema Validations
| Field | Constraints |
|-------|-------------|
| `slug` | `^[a-z0-9-]+$`, max 50 chars, PK |
| `title` | Max 100 chars |
| `description` | Min 5 words |
| `version` | Pattern: `N/A`, `A\d+`, `V?[\d.]+(?:b\d+)?` |
| `gameVersion` | Same as version pattern |
| `bannerUrl` | Required, valid URL |
| `screenshots` | Min 1 required |
| `tags` | Min 1 non-lang/non-gamever tag |

### Game Version Normalization
```typescript
// V1.0 -> V1.0 (display), 1_0 (storage)
// A21 -> A21 (display), a21 (storage)
// VA21 -> A21 (strip V before A)
// N/A -> N/A (display), na (storage)
```

### Tag Normalization Rules
| Category | Value Format | Example |
|----------|-------------|---------|
| `author` | lowercase, underscores | `snufkin` |
| `gamever` | lowercase, underscores | `1_0`, `a21` |
| `lang` | lowercase, underscores | `english` |
| `status` | lowercase | `active` |
| `newscat` | lowercase | `update` |
| `tag` | lowercase, hyphens | `survival-mode` |

---

## 🔌 API Routes

```
api/
├── auth/[...nextauth]/        # NextAuth.js handlers
├── mods/[slug]/
│   └── suggest-localization/  # POST translation suggestion
├── admin/
│   └── sync-tags/            # POST sync tag data
├── upload/                    # POST file upload to Vercel Blob
└── unfurl/                    # POST link unfurling
```

---

## 🌐 i18n Structure

```
messages/
├── en.json                    # English (default)
└── ru.json                    # Russian
```

Translation keys follow namespace pattern:
```json
{
  "metadata": { "title": "..." },
  "navigation": { "mods": "...", "news": "..." },
  "mod": { "version": "...", "author": "..." },
  "editor": { "title": "...", "save": "..." },
  "admin": { "dashboard": "..." },
  "profile": { "overview": "..." }
}
```

---

## 🧪 Testing

```
e2e/
├── fixtures/
├── tests/
└── utils/

# Commands
npm run test       # Vitest unit tests
npm run test:e2e   # Playwright E2E tests
```

---

## 📦 Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `DISCORD_CLIENT_ID` | OAuth app ID |
| `DISCORD_CLIENT_SECRET` | OAuth secret |
| `AUTH_SECRET` | NextAuth secret |
| `AUTH_TRUST_HOST` | Host trust setting |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access |

---

## 🎨 Design System

### Colors (Tailwind v4)
- Primary: `zinc` scale for neutrals
- Accent: `emerald` for success/actions
- Destructive: `red` for errors
- Custom tag colors defined in `src/lib/tag-colors.ts`

### Components Style
- Radix UI primitives for accessibility
- Custom CSS variables in `globals.css`
- Tailwind CSS v4 with PostCSS

---

## 🐛 Known Issues & Quirks

1. **Image optimization** disabled in dev mode (`unoptimized: isDev`)
2. **Prisma client** generated to `src/generated/prisma`
3. **Auth adapter** uses type assertion `as any` due to Prisma/Auth.js version mismatch
4. **Tag colors** are auto-assigned based on category + value combinations
5. **Mod stats** stored as strings for big numbers (downloads, views)
6. **News tags** stored as JSON array with frozen snapshot data

---

## 🔍 Quick Find Index

### By Feature
| Feature | Entry Point |
|---------|-------------|
| Create Mod | `src/app/actions/mod-actions.ts::createMod` |
| Edit Mod | `src/app/[locale]/editor/[slug]/page.tsx` |
| Mod Display | `src/components/mod/UnifiedModLayout.tsx` |
| Tag Management | `src/app/[locale]/admin/tags/page.tsx` |
| News Creation | `src/app/actions/news-actions.ts::createNews` |
| User Profile | `src/app/[locale]/profile/page.tsx` |
| Search | `src/app/actions/search-actions.ts` |
| File Upload | `src/app/api/upload/route.ts` |

### By Operation Type
| Operation | Location |
|-----------|----------|
| Database CRUD | `src/app/actions/*-actions.ts` |
| Schema Validation | `src/schemas/*.schema.ts` |
| Tag Helpers | `src/lib/tag-utils.ts` |
| Mod Helpers | `src/lib/mod-utils.ts` |
| Auth | `src/auth.ts` + `src/types/next-auth.d.ts` |
| UI Components | `src/components/ui/*.tsx` |
| Layout Components | `src/components/layouts/*.tsx` |

---

## 📝 Schema Quick Reference

### ModData (Complete)
```typescript
interface ModData {
  title: string;              // required, max 100
  slug: string;               // required, ^[a-z0-9-]+$, max 50
  version: string;            // required, version pattern
  author: string;             // required or author tag
  description: string;        // required, min 5 words
  status: ModStatusType;      // enum
  gameVersion: string;        // required, version pattern
  bannerUrl: string;          // required, URL
  isSaveBreaking: boolean;    // default false
  features: string[];         // default []
  tags: TagData[];            // min 1 required
  installationSteps: string[];// default []
  links: ModLinks;            // {download, discord, community[], donations[]}
  stats: ModStats;            // {rating, ratingCount, downloads, views}
  videos: ModVideos;          // {trailer, review}
  screenshots: string[];      // min 1 required, URLs
  changelog: ModChangelog[];  // {version, date, changes[], isSaveBreaking?}
  localizations: ModLocalization[]; // {code, name, type, url?}
}
```

---

## 🔗 External Dependencies

| Package | Purpose |
|---------|---------|
| `next-auth` v5 beta | Authentication |
| `@auth/prisma-adapter` | Auth DB adapter |
| `next-intl` v4 | Internationalization |
| `@prisma/client` v7 | ORM |
| `@tiptap/*` | Rich text editor |
| `@radix-ui/*` | UI primitives |
| `@vercel/blob` | File storage |
| `zod` v4 | Schema validation |
| `react-hook-form` | Form management |
| `recharts` | Charts |
| `lucide-react` | Icons |

---

## ✅ Validation Checklist (Before Commits)

- [ ] Schema changes → regenerate Prisma client
- [ ] New action → add to `src/schemas/` if needed
- [ ] Route changes → update `src/lib/routes.ts`
- [ ] New component → check if UI primitive exists first
- [ ] Tag logic → use helpers from `src/lib/tag-utils.ts`
- [ ] Auth required → check `session?.user` exists
- [ ] Cache invalidation → call `revalidatePath()` appropriately
- [ ] i18n strings → add to `messages/en.json` and `ru.json`

---

*Map generated for AI navigation - Last updated: 2026-01-30*
