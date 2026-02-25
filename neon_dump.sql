--
-- PostgreSQL database dump
--

\restrict RdnJuRkBvCgtJMPvKeKLeDvZmpfZ6dH3r6TtoyX8nOMv4g01oUkgCtkW2LuMQcF

-- Dumped from database version 17.8 (6108b59)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."ViewHistory" DROP CONSTRAINT IF EXISTS "ViewHistory_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."ViewHistory" DROP CONSTRAINT IF EXISTS "ViewHistory_modSlug_fkey";
ALTER TABLE IF EXISTS ONLY public."UserSocialLink" DROP CONSTRAINT IF EXISTS "UserSocialLink_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserBadge" DROP CONSTRAINT IF EXISTS "UserBadge_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserBadge" DROP CONSTRAINT IF EXISTS "UserBadge_badgeId_fkey";
ALTER TABLE IF EXISTS ONLY public."TranslationSuggestion" DROP CONSTRAINT IF EXISTS "TranslationSuggestion_modSlug_fkey";
ALTER TABLE IF EXISTS ONLY public."Subscription" DROP CONSTRAINT IF EXISTS "Subscription_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Subscription" DROP CONSTRAINT IF EXISTS "Subscription_modSlug_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProfileView" DROP CONSTRAINT IF EXISTS "ProfileView_viewedId_fkey";
ALTER TABLE IF EXISTS ONLY public."News" DROP CONSTRAINT IF EXISTS "News_modSlug_fkey";
ALTER TABLE IF EXISTS ONLY public."Mod" DROP CONSTRAINT IF EXISTS "Mod_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."ModTag" DROP CONSTRAINT IF EXISTS "ModTag_tagId_fkey";
ALTER TABLE IF EXISTS ONLY public."ModTag" DROP CONSTRAINT IF EXISTS "ModTag_modId_fkey";
ALTER TABLE IF EXISTS ONLY public."ModSubmission" DROP CONSTRAINT IF EXISTS "ModSubmission_submitterId_fkey";
ALTER TABLE IF EXISTS ONLY public."DownloadHistory" DROP CONSTRAINT IF EXISTS "DownloadHistory_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."DownloadHistory" DROP CONSTRAINT IF EXISTS "DownloadHistory_modSlug_fkey";
ALTER TABLE IF EXISTS ONLY public."AnonymousView" DROP CONSTRAINT IF EXISTS "AnonymousView_modSlug_fkey";
ALTER TABLE IF EXISTS ONLY public."AnonymousDownload" DROP CONSTRAINT IF EXISTS "AnonymousDownload_modSlug_fkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
DROP INDEX IF EXISTS public."UserSocialLink_userId_platform_key";
DROP INDEX IF EXISTS public."UserBadge_userId_badgeId_key";
DROP INDEX IF EXISTS public."ProfileView_viewedId_viewedAt_idx";
DROP INDEX IF EXISTS public."Badge_slug_key";
DROP INDEX IF EXISTS public."AnonymousView_viewedAt_idx";
DROP INDEX IF EXISTS public."AnonymousDownload_modSlug_ipAddress_key";
DROP INDEX IF EXISTS public."AnonymousDownload_downloadedAt_idx";
DROP INDEX IF EXISTS neon_auth.users_sync_deleted_at_idx;
ALTER TABLE IF EXISTS ONLY public."ViewHistory" DROP CONSTRAINT IF EXISTS "ViewHistory_userId_modSlug_key";
ALTER TABLE IF EXISTS ONLY public."ViewHistory" DROP CONSTRAINT IF EXISTS "ViewHistory_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_email_key";
ALTER TABLE IF EXISTS ONLY public."UserSocialLink" DROP CONSTRAINT IF EXISTS "UserSocialLink_pkey";
ALTER TABLE IF EXISTS ONLY public."UserBadge" DROP CONSTRAINT IF EXISTS "UserBadge_pkey";
ALTER TABLE IF EXISTS ONLY public."TranslationSuggestion" DROP CONSTRAINT IF EXISTS "TranslationSuggestion_pkey";
ALTER TABLE IF EXISTS ONLY public."Tag" DROP CONSTRAINT IF EXISTS "Tag_pkey";
ALTER TABLE IF EXISTS ONLY public."Tag" DROP CONSTRAINT IF EXISTS "Tag_category_value_key";
ALTER TABLE IF EXISTS ONLY public."Subscription" DROP CONSTRAINT IF EXISTS "Subscription_userId_modSlug_key";
ALTER TABLE IF EXISTS ONLY public."Subscription" DROP CONSTRAINT IF EXISTS "Subscription_pkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_sessionToken_key";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."ProfileView" DROP CONSTRAINT IF EXISTS "ProfileView_pkey";
ALTER TABLE IF EXISTS ONLY public."News" DROP CONSTRAINT IF EXISTS "News_pkey";
ALTER TABLE IF EXISTS ONLY public."Mod" DROP CONSTRAINT IF EXISTS "Mod_pkey";
ALTER TABLE IF EXISTS ONLY public."ModTag" DROP CONSTRAINT IF EXISTS "ModTag_pkey";
ALTER TABLE IF EXISTS ONLY public."ModSubmission" DROP CONSTRAINT IF EXISTS "ModSubmission_slug_key";
ALTER TABLE IF EXISTS ONLY public."ModSubmission" DROP CONSTRAINT IF EXISTS "ModSubmission_pkey";
ALTER TABLE IF EXISTS ONLY public."DownloadHistory" DROP CONSTRAINT IF EXISTS "DownloadHistory_userId_modSlug_sessionId_key";
ALTER TABLE IF EXISTS ONLY public."DownloadHistory" DROP CONSTRAINT IF EXISTS "DownloadHistory_pkey";
ALTER TABLE IF EXISTS ONLY public."Badge" DROP CONSTRAINT IF EXISTS "Badge_pkey";
ALTER TABLE IF EXISTS ONLY public."AnonymousView" DROP CONSTRAINT IF EXISTS "AnonymousView_pkey";
ALTER TABLE IF EXISTS ONLY public."AnonymousView" DROP CONSTRAINT IF EXISTS "AnonymousView_modSlug_sessionId_key";
ALTER TABLE IF EXISTS ONLY public."AnonymousDownload" DROP CONSTRAINT IF EXISTS "AnonymousDownload_pkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_provider_providerAccountId_key";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_pkey";
ALTER TABLE IF EXISTS ONLY neon_auth.users_sync DROP CONSTRAINT IF EXISTS users_sync_pkey;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public."ViewHistory";
DROP TABLE IF EXISTS public."UserSocialLink";
DROP TABLE IF EXISTS public."UserBadge";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."TranslationSuggestion";
DROP TABLE IF EXISTS public."Tag";
DROP TABLE IF EXISTS public."Subscription";
DROP TABLE IF EXISTS public."Session";
DROP TABLE IF EXISTS public."ProfileView";
DROP TABLE IF EXISTS public."News";
DROP TABLE IF EXISTS public."ModTag";
DROP TABLE IF EXISTS public."ModSubmission";
DROP TABLE IF EXISTS public."Mod";
DROP TABLE IF EXISTS public."DownloadHistory";
DROP TABLE IF EXISTS public."Badge";
DROP TABLE IF EXISTS public."AnonymousView";
DROP TABLE IF EXISTS public."AnonymousDownload";
DROP TABLE IF EXISTS public."Account";
DROP TABLE IF EXISTS neon_auth.users_sync;
DROP FUNCTION IF EXISTS public.show_db_tree();
DROP TYPE IF EXISTS public."UserRole";
DROP SCHEMA IF EXISTS neon_auth;
--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA neon_auth;


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'MODERATOR',
    'DEVELOPER',
    'ADMIN'
);


--
-- Name: show_db_tree(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.show_db_tree() RETURNS TABLE(tree_structure text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- First show all databases
    RETURN QUERY
    SELECT ':file_folder: ' || datname || ' (DATABASE)'
    FROM pg_database 
    WHERE datistemplate = false;

    -- Then show current database structure
    RETURN QUERY
    WITH RECURSIVE 
    -- Get schemas
    schemas AS (
        SELECT 
            n.nspname AS object_name,
            1 AS level,
            n.nspname AS path,
            'SCHEMA' AS object_type
        FROM pg_namespace n
        WHERE n.nspname NOT LIKE 'pg_%' 
        AND n.nspname != 'information_schema'
    ),

    -- Get all objects (tables, views, functions, etc.)
    objects AS (
        SELECT 
            c.relname AS object_name,
            2 AS level,
            s.path || ' → ' || c.relname AS path,
            CASE c.relkind
                WHEN 'r' THEN 'TABLE'
                WHEN 'v' THEN 'VIEW'
                WHEN 'm' THEN 'MATERIALIZED VIEW'
                WHEN 'i' THEN 'INDEX'
                WHEN 'S' THEN 'SEQUENCE'
                WHEN 'f' THEN 'FOREIGN TABLE'
            END AS object_type
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN schemas s ON n.nspname = s.object_name
        WHERE c.relkind IN ('r','v','m','i','S','f')

        UNION ALL

        SELECT 
            p.proname AS object_name,
            2 AS level,
            s.path || ' → ' || p.proname AS path,
            'FUNCTION' AS object_type
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        JOIN schemas s ON n.nspname = s.object_name
    ),

    -- Combine schemas and objects
    combined AS (
        SELECT * FROM schemas
        UNION ALL
        SELECT * FROM objects
    )

    -- Final output with tree-like formatting
    SELECT 
        REPEAT('    ', level) || 
        CASE 
            WHEN level = 1 THEN '└── :open_file_folder: '
            ELSE '    └── ' || 
                CASE object_type
                    WHEN 'TABLE' THEN ':bar_chart: '
                    WHEN 'VIEW' THEN ':eye: '
                    WHEN 'MATERIALIZED VIEW' THEN ':newspaper: '
                    WHEN 'FUNCTION' THEN ':zap: '
                    WHEN 'INDEX' THEN ':mag: '
                    WHEN 'SEQUENCE' THEN ':1234: '
                    WHEN 'FOREIGN TABLE' THEN ':globe_with_meridians: '
                    ELSE ''
                END
        END || object_name || ' (' || object_type || ')'
    FROM combined
    ORDER BY path;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: AnonymousDownload; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AnonymousDownload" (
    id text NOT NULL,
    "modSlug" text NOT NULL,
    "ipAddress" text NOT NULL,
    "downloadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AnonymousView; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AnonymousView" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "modSlug" text NOT NULL,
    "sessionId" text NOT NULL,
    "viewedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: Badge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Badge" (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    icon text NOT NULL,
    description text NOT NULL,
    rarity text DEFAULT 'common'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DownloadHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DownloadHistory" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "modSlug" text NOT NULL,
    version text NOT NULL,
    "downloadedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "sessionId" text NOT NULL
);


--
-- Name: Mod; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Mod" (
    slug text NOT NULL,
    title text NOT NULL,
    version text NOT NULL,
    author text NOT NULL,
    "authorId" text,
    description text NOT NULL,
    status text NOT NULL,
    "gameVersion" text NOT NULL,
    "bannerUrl" text,
    "isSaveBreaking" boolean DEFAULT false,
    features text[] DEFAULT '{}'::text[],
    "installationSteps" text[] DEFAULT '{}'::text[],
    links jsonb NOT NULL,
    videos jsonb NOT NULL,
    changelog jsonb NOT NULL,
    localizations jsonb NOT NULL,
    rating double precision DEFAULT 0,
    "ratingCount" integer DEFAULT 0,
    downloads text DEFAULT '0'::text,
    views text DEFAULT '0'::text,
    screenshots text[] DEFAULT '{}'::text[],
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "downloadsThisMonth" integer DEFAULT 0 NOT NULL
);


--
-- Name: ModSubmission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ModSubmission" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    version text NOT NULL,
    author text NOT NULL,
    description text NOT NULL,
    "gameVersion" text NOT NULL,
    "bannerUrl" text,
    "isSaveBreaking" boolean DEFAULT false,
    features text[] DEFAULT '{}'::text[],
    "installationSteps" text[] DEFAULT '{}'::text[],
    links jsonb NOT NULL,
    videos jsonb NOT NULL,
    changelog jsonb NOT NULL,
    localizations jsonb NOT NULL,
    screenshots text[] DEFAULT '{}'::text[],
    tags jsonb NOT NULL,
    "submitterId" text NOT NULL,
    "submitterNote" text,
    status text DEFAULT 'pending'::text,
    "rejectionReason" text,
    "submittedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" timestamp without time zone
);


--
-- Name: ModTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ModTag" (
    "modId" text NOT NULL,
    "tagId" text NOT NULL,
    "isExternal" boolean DEFAULT false,
    "externalLink" text
);


--
-- Name: News; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."News" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "modSlug" text,
    "modName" text,
    "modVersion" text,
    "gameVersion" text,
    "actionText" text DEFAULT 'released'::text,
    content text NOT NULL,
    description text,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "wipeRequired" boolean DEFAULT false,
    "sourceUrl" text,
    tags jsonb DEFAULT '[]'::jsonb,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "newscatTagId" text,
    "gameVersionTagId" text
);


--
-- Name: ProfileView; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProfileView" (
    id text NOT NULL,
    "viewerId" text,
    "viewedId" text NOT NULL,
    "viewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp without time zone NOT NULL
);


--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subscription" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "modSlug" text NOT NULL,
    "subscribedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "unseenVersions" integer DEFAULT 0
);


--
-- Name: Tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tag" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    category text NOT NULL,
    value text NOT NULL,
    "displayName" text NOT NULL,
    color text
);


--
-- Name: TranslationSuggestion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TranslationSuggestion" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "modSlug" text NOT NULL,
    "modName" text NOT NULL,
    "languageCode" text NOT NULL,
    "languageName" text NOT NULL,
    author text NOT NULL,
    link text NOT NULL,
    status text DEFAULT 'pending'::text,
    "submittedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp without time zone,
    image text,
    bio text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole",
    "isBanned" boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "isProfilePublic" boolean DEFAULT true,
    "profileViews" integer DEFAULT 0
);


--
-- Name: UserBadge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserBadge" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "badgeId" text NOT NULL,
    "earnedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserSocialLink; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserSocialLink" (
    id text NOT NULL,
    "userId" text NOT NULL,
    platform text NOT NULL,
    url text NOT NULL
);


--
-- Name: ViewHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ViewHistory" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "modSlug" text NOT NULL,
    "viewedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    comment text
);


--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
cmjnh24sq0001y4atdeemzzo3	cmjnh24rd0000y4atmdivnv92	oauth	discord	481536362303193091	qF3xEVoK1Pvy31OCM1Ku2i34w5kkeq	MTQ1MDIwNzc5NDM0NjIwMTA4OA.7i6L0X1AVEEcKeRL61t9ZXIkPB9Ekq	1767394649	bearer	email identify	\N	\N
cmjr9xhs5000104l28heviwv7	cmjr9xhp7000004l2pqi0rilw	oauth	discord	936725812638515200	onnJIZyjfRw4RiKgv5El4Ctbf7ruID	MTQ1MDIwNzc5NDM0NjIwMTA4OA.RbIVIvZ26Xi9rCMr6ar4O120i1hEI0	1767624539	bearer	identify email	\N	\N
\.


--
-- Data for Name: AnonymousDownload; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AnonymousDownload" (id, "modSlug", "ipAddress", "downloadedAt") FROM stdin;
\.


--
-- Data for Name: AnonymousView; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AnonymousView" (id, "modSlug", "sessionId", "viewedAt") FROM stdin;
\.


--
-- Data for Name: Badge; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Badge" (id, slug, name, icon, description, rarity, "createdAt") FROM stdin;
\.


--
-- Data for Name: DownloadHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DownloadHistory" (id, "userId", "modSlug", version, "downloadedAt", "sessionId") FROM stdin;
cmjqee74z000br0atzxtr0c5n	cmjnh24rd0000y4atmdivnv92	vikings-mod-to-be-released	N/A	2025-12-29 00:06:12.131	a9feabaf-bd5b-4941-9cd7-73e27fd54e06
\.


--
-- Data for Name: Mod; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Mod" (slug, title, version, author, "authorId", description, status, "gameVersion", "bannerUrl", "isSaveBreaking", features, "installationSteps", links, videos, changelog, localizations, rating, "ratingCount", downloads, views, screenshots, "createdAt", "updatedAt", "downloadsThisMonth") FROM stdin;
cloud-mod	Cloud Mod	0.7.4	nocloud4u	\N	An attempt at adding realistic mechanics while retaining QOL features. Cloud Mod adds an increase in difficulty and includes lots of popular mods.	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/HDPdwMTBtX", "download": "https://www.nexusmods.com/7daystodie/mods/4606", "community": [], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:11:57.922	2025-12-30 13:25:36.951	0
forsaken-trail	Forsaken Trail	1.1.2.0	HaidrGna	\N	Forsaken Trail is a complete overhaul of the game and is the successor of Gnamod. The mod focuses on wilderness survival, exploration and improving the overal survival experience. This mod changes most of the game systems in an attempt to create something unique and it does not try to hold the player’s hand that much, making it quite challenging for anyone new to it. The world mostly decides the gamestage so going into higher level POIs or biomes may not be the wisest strategy because of this. You can find any item from the first day due to the unique way loot is generated where player level and gamestage only influence the amount you find.\nThe mod also comes with a unique character creation system where you select your attributes, skills and background before you spawn into the game. You will begin the game with gear and technology unlocked based on these choices. This gear in addition to a number of tutorial challenges will help you survive your first day and first week.\nThe zombies and animals in the world are all randomized, their walk, abilities and sizes will be decided the moment they spawn and are further influence by their type. You will encounter zombies that can puke or walk on all four legs. In the more natural biomes animals are more prevalent, while near cities and destroyed areas you will see a lot more zombies. Be careful around buildings as zombies will be awake and roaming around and they have keen ears.	active	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/RSkrUwvxpe", "download": "https://drive.google.com/drive/folders/1AKFQyQFZFopZuhDB3dOk8Mrwt4snGcaX?usp=sharing", "community": [{"url": "https://www.youtube.com/@haidrgna", "name": "YouTube"}, {"url": "https://community.7daystodie.com/topic/41759-forsaken-trail/", "name": "Community"}], "donations": []}	{"review": "", "trailer": "https://youtu.be/ssLzFVfjLF8"}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"code": "[Russian", "name": "[Russian", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:08.697	2025-12-28 15:22:42.517	0
endz	EndZ	2.0.1	TheeLegion	\N	This mod was designed to walk the line between realism and fun engaging gameplay. Where realism became grindy or not fun I tried to aim for engaging gameplay mechanics with a focus on risk and reward and a strong sense of consequences. Death in this mod is permanent with few exceptions. In this mod when death occurs your player data is wiped and you will respawn as a fresh new player	active	V2.0	\N	f	{}	{}	{"discord": "https://discord.gg/mRUFdcqUjp", "download": "https://dev.azure.com/ryanmfranks1989/_git/EndZ%201.0%20Release", "community": [], "donations": [{"url": "https://www.paypal.me/EndZTheeLegion", "name": "Paypal"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:04.521	2025-12-28 15:33:12.972	0
escape-from-tarkov	Escape From Tarkov	1.0	BryanDVS, M14	\N	This is a work in progress mod, that adds 100+ new guns, 45+ types of ammo, 200+ new item modifiers and 70+ new items. It changes the vanilla mechanics drastically, extends the endgame and makes everything a bit harder, but not frustrating. All guns feature custom animations, visible attachments, grip poses, multiaction (underbarrel-launcher) etc.	active	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/WpVPJWj7Xk", "download": "https://7daystodiemods.com/escape-from-tarkov-overhaul/", "community": [], "donations": []}	{"review": "https://youtu.be/fwP53XRxFhg", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/6197", "code": "Russian", "name": "Russian", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/6754", "code": "Japanese", "name": "Japanese", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/7043", "code": "Chinese", "name": "Chinese", "type": "external"}]	0	0	0	0	{}	2025-12-28 15:12:06.959	2025-12-28 15:18:40.538	0
black-forrest	Black Forrest	1.0.0	Black Forrest Team	\N	- custom/unique Pois\n- bigger wandering hordes\n- various music radios\n- elite vanilla gameplay\n- when things get rough, **run Forrest, run**	active	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/qQ6zyKH2Ee", "download": "https://www.nexusmods.com/7daystodie/mods/6692", "community": [{"url": "https://7daystodiemods.com/black-forrest/", "name": "7 Days to Die Mods"}, {"url": "https://www.twitch.tv/antipas66", "name": "Twitch"}], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:11:56.691	2025-12-28 15:22:34.861	0
apocalypse-now	Apocalypse Now	3.1	Killerbunny264	\N	Apocalypse Now is a mod for 7 Days to Die.	on_hold	A20	\N	f	{}	{}	{"discord": "https://discord.gg/t9gp97mFrA", "download": "https://www.nexusmods.com/7daystodie/mods/1446", "community": [{"url": "https://gitlab.com/killerbunny264/Apoc-Now-V3-1-Stable", "name": "GitLab"}, {"url": "https://www.youtube.com/@killerbunny2648", "name": "Youtube"}], "donations": []}	{"review": "https://youtu.be/IP-kzPYZKts", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:18:27.28	2025-12-30 13:12:31.082	0
28-alphas-later	28 Alphas Later	1.0.0.0	Hells Janitor	\N	The idea behind this mod is to slow progression, make traders less powerful, and generally extend the time for a playthrough, while keeping the vanilla look and feel.	active	V1.3	\N	f	{}	{}	{"discord": "https://discord.gg/GTQecRSMjM", "download": "https://7daystodiemods.com/28-alphas-later/", "community": [{"url": "https://community.7daystodie.com/topic/34695-28-alphas-later/", "name": "Community"}, {"url": "https://www.youtube.com/c/Hells_Janitor", "name": "YouTube"}, {"url": "https://www.twitch.tv/hellsjanitortv", "name": "Twitch"}, {"url": "https://twitter.com/HellsJanitorTV", "name": "X"}, {"url": "https://kick.com/hellsjanitor", "name": "Kick"}], "donations": []}	{"review": "https://youtu.be/rBKfCw0qd2E", "trailer": "https://youtu.be/rBKfCw0qd2E"}	[{"date": "2025-12-29T22:09:08.379Z", "changes": [], "version": "1.0.0.0", "isSaveBreaking": false}, {"date": "2025-12-27T21:00:00.000Z", "changes": [], "version": "", "isSaveBreaking": false}]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	2	{}	2025-12-28 15:11:46.416	2026-01-30 09:21:32.177	0
darkness-falls	Darkness Falls	6.0.0.20	Khaine	\N	Darkness Falls is not an easy mod. The primary intent is to drag out the early game, so it will take you longer than usual to get to Iron and Steel. Several things you are used to being able to make now require classes or perks to be purchased, and night-time is not fun time. The wasteland? Even less so.\nThis is a mod I originally created to fix a few "issues" myself, my wife and some friends felt the game had. Turns out I really enjoy modding so I've expanded on it quite a bit. The intent is to drag out the early game, so it will take you longer than usual to get to Iron and Steel. As I started playing in Alpha 8,  I wanted to try and bring back a few things from that era. Sharp rocks and sticks are pretty good examples of that, and I want to try and incorporate more features from that era of gameplay.\nThe behemoth, originally unveiled in A16 and then scrapped is alive and well in this mod, along with some extra friends. Expect to see new zombies, new horrors and don't anticipate an easy ride. A mostly comprehensive list of features can be found below.	active	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/darknessfallsmod", "download": "https://www.nexusmods.com/7daystodie/mods/235", "community": [{"url": "https://dev.azure.com/KhaineUK/_git/Darkness%20Falls%20V6", "name": "Dev"}, {"url": "https://www.youtube.com/channel/UC3yu4ucbt_3_KJAki5jncBg", "name": "YouTube"}, {"url": "https://www.twitch.tv/khaineskorner", "name": "Twitch"}, {"url": "https://x.com/KhainesKorner", "name": "X"}, {"url": "https://www.redbubble.com/people/darkness-falls/shop", "name": "Redbubble"}], "donations": [{"url": "https://www.patreon.com/darknessfallsmod", "name": "Patreon"}, {"url": "https://www.paypal.me/khainegb", "name": "Paypal"}]}	{"review": "https://youtu.be/zgYXb0wAWh4", "trailer": "https://youtu.be/zHnO5xrt178"}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/7007", "code": "Russian", "name": "Russian", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/2438", "code": "German", "name": "German", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/2621", "code": "Japanese", "name": "Japanese", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/6449", "code": "Portugese", "name": "Portugese", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/4264", "code": "Spanish", "name": "Spanish", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/4245", "code": "Ukrainian", "name": "Ukrainian", "type": "external"}]	0	0	0	0	{}	2025-12-28 15:12:00.98	2025-12-28 15:33:13.135	0
smrgsbord	Smörgåsbord	2.3.1	FlufferNutterSandwitch	\N	/ ˈsmɔr gəsˌbɔrd, -ˌboʊrdor, often, ˈʃmɔr- /\n*noun*	discontinued	V2.3	\N	f	{}	{}	{"discord": "https://discord.gg/VkQJy6sfqT", "download": "https://github.com/Fluffernuttersandwich/Better7D2DbyFNS", "community": [{"url": "https://www.youtube.com/@FlufferNutterSandwich", "name": "YouTube"}], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:31.998	2025-12-28 15:23:07.408	0
tongo-mod	Tongo mod	3.5.4	TEKJAGAMEPLAYS	\N	Couldn’t find a description. Look at the list of features	active	V2.3	\N	f	{}	{}	{"discord": "https://discord.gg/9G3JeVnJS5", "download": "https://7daystodiemods.com/tongomod/", "community": [{"url": "https://discord.com/channels/671100806539509760/1386068957945135196/1391781764355068087", "name": "Discord"}, {"url": "https://www.youtube.com/@TEKJAGAMEPLAYS", "name": "YouTube"}], "donations": [{"url": "https://www.paypal.com/donate/?hosted_button_id=SLQXTL4TAEM42", "name": "Paypal"}]}	{"review": "", "trailer": "https://youtu.be/8QPxTkX4L0Y"}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"code": "Spanish", "name": "Spanish", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:33.543	2025-12-28 15:33:13.32	0
undead-country	Undead Country	1.3	DoubleBlundy	\N	Undead Country was made with the intention of changing the mostly dead world with only a few zombies outside, to a zombie infested country. Cities are huge and and in every biome. Guns are easier to get and looting POIs is more rewarding than quests. There are new tiers of zombies and quests to kill boss zombies.	active	V2.4	\N	f	{}	{}	{"discord": "http://discord.gg/77E7XwvDnZ", "download": "https://www.nexusmods.com/7daystodie/mods/8037", "community": [{"url": "https://7daystodiemods.com/undead-country/", "name": "7 Days to Die Mods"}], "donations": [{"url": "https://www.patreon.com/DoubleBlundy/membership", "name": "Patreon"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:36.078	2025-12-28 15:23:34.038	0
undead-water-two	Undead Water Two	2.9.9.999	DirkillerGaming	\N	Here comes Undead Water Two, the Successor of Undead Water (1.x).\nThis Overhaul-Mod comes with an exclusive Water-Map “Atlantica Undead UW Two” and a lot of new Content.	active	V2.1	\N	f	{}	{}	{"discord": "", "download": "https://7daystodiemods.com/undead-water-two/", "community": [{"url": "https://www.buymeacoffee.com/dirkillergaming", "name": "Buy Me a Coffee"}, {"url": "https://www.youtube.com/@DirkillerGaming", "name": "YouTube"}], "donations": [{"url": "https://www.paypal.com/paypalme/dirkidon", "name": "Paypal"}]}	{"review": "", "trailer": "https://youtu.be/rD4bwPSC2Sw?si=_yThbQjQgBEIivr4"}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:41.057	2025-12-28 15:33:13.199	0
advanced-survival-overhaul	Advanced Survival Overhaul	V0.01	Dullahan_Reaper	\N	The idea behind this mod is to slow progression, make traders less powerful, and generally extend the time for a playthrough, while keeping the vanilla look and feel.	active	V1	\N	f	{}	{}	{"discord": "https://discord.gg/7nMH6gvu6a", "download": "https://www.nexusmods.com/7daystodie/mods/7465", "community": [{"url": "https://www.twitch.tv/greezelife", "name": "Twitch"}], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	1	{}	2025-12-28 15:11:48.832	2026-01-30 09:21:48.909	0
the-asylum	The Asylum	2.4b7	badbunny87	\N	A massive overhaul mod for 7 Days to Die that transforms the game into a hellish survival horror experience. With 750+ custom content pieces, 600+ entities, 7 character classes, and 320 unique quests - The Asylum offers a completely new gameplay experience where nightmares become reality.	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/H5qfhSNXwn", "download": "https://asylumstn.com/", "community": [{"url": "https://www.mediafire.com/file_premium/35uh4e2s26fqgwn/Asylum2.4b7.zip/file", "name": "Mediafire"}, {"url": "https://drive.google.com/file/d/1jqqewHI-JjwXgA23IWm8ezC-dIiVzNdv/view?usp=sharing", "name": "Google Docs"}, {"url": "https://asylumstn.com/", "name": "Asylumstn"}], "donations": []}	{"review": "https://youtu.be/LP-JmfkG_KI", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:11:53.933	2025-12-28 15:24:03.619	0
5th-day	5th day	v56	SarahAndJeff	\N	Jeff had this weird thought that he should take the idea from Crystal Hell mod (Thanks Shavick) and build upon the learn by doing system. Then along the way was like. ok I don't like the workbechs let's make our own and change how you craft them, Then out of the blue was like I don't like the weapons and how you craft ammo let's change that too, etc.	active	V2.1	\N	f	{}	{}	{"discord": "https://discord.gg/WuEVwMqj8e", "download": "https://github.com/SarahandJeff/5thDay", "community": [{"url": "https://discord.gg/ARM7zYD9Jb", "name": "Discord"}], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:11:47.633	2025-12-28 15:23:40.448	0
nord-army	Nord Army	3.1.3	NORDMANN	\N	The NordArmy Mod 3.1 revolutionizes the classic survival experience of 7 Days to Die, bringing a fresh and thrilling new gameplay dynamic.\nWith unique mechanics, innovative features, and a massive content overhaul, this mod introduces elements never seen before in the game.\nExpect enhanced combat, detailed world-building, and a deeper survival challenge that transforms the way players navigate the apocalypse.\nWhether you’re a veteran survivor or new to the wasteland, NordArmy Mod redefines the adventure, offering surprises at every turn.\nReady to face the unknown? The world of 7 Days to Die will never be the same again!	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/PVvRQdsVhc", "download": "https://7daystodiemods.com/nordarmy-mod/", "community": [{"url": "https://streamelements.com/nordmann845/tip", "name": "StreamElements"}], "donations": []}	{"review": "", "trailer": "https://youtu.be/oUD2QHscIP4"}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"code": "German", "name": "German", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:17.07	2025-12-28 15:24:10.814	0
never-alone	Never Alone	1.0.0	IceRogue	\N	**Inspired by Project Zomboid, you will notice the simularities from the start. Mobs will surround you at times with a never ending horde. Various Romero mod settings, so headshots are important. There are four skyscrapers you can complete as your final goals**	unknown	A21	\N	f	{}	{}	{"discord": "https://discord.gg/pgcx7MthNS", "download": "https://www.dropbox.com/scl/fi/adiq3oko51kfpls21ph63/Never-Alone-202140530.zip?rlkey=nujggs4iphpo0d57d6xgi0o01&dl=0", "community": [], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:15.551	2025-12-28 15:18:47.412	0
greys-prophesy	Grey’s Prophesy	1.4.2.0	GanTheGrey	\N	Grey’s Prophecy is a flavoring of the default game. The goal of the mod is to add fun stuff, and some humor, while keeping close to the vanilla formula.	active	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/dqC3qrSH9F", "download": "https://dev.azure.com/greysprophecy/Greys_Prophecy/_git/GP_V1?Branch=main", "community": [{"url": "https://community.7daystodie.com/topic/18933-greys-prophecy-mod/", "name": "Community"}], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:11.579	2025-12-28 15:24:04.384	0
joke-mod	Joke mod	5.3.0	RizzoMF,Zilox	\N	This mod is about 85% a joke, 10% serious, 5% butterscotch ripple. It has been an idea for years and is finally a realization. It literally started as a joke and grew from there. The mod has been made so that players can have a serious playthrough and not just log in for 5 minutes, have some laughs, and never play it again. Although some people might still do that. Rude!	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/awS7euCwtd", "download": "https://www.nexusmods.com/7daystodie/mods/1834", "community": [{"url": "https://dev.azure.com/RizzoMF/_git/JokeModV5", "name": "Dev"}, {"url": "https://community.7daystodie.com/topic/35415-joke-mod-version-4/", "name": "Community"}, {"url": "https://twitter.com/joke_mod", "name": "X"}], "donations": [{"url": "https://paypal.me/rizzomf", "name": "Paypal"}, {"url": "https://www.paypal.com/donate/?hosted_button_id=S96TPW9B2MSBW", "name": "Paypal"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:14.333	2025-12-28 15:33:13.442	0
silent-hill	Silent Hill	1.0.0	Killerbunny264	\N	A different style to play\nNo horde night or traders\nyou need to survive on your own\nbe aware of the wandering hordes!	on_hold	V1.2	\N	f	{}	{}	{"discord": "", "download": "https://www.nexusmods.com/7daystodie/mods/6382", "community": [{"url": "https://community.7daystodie.com/topic/42045-silent-hill-mod-random-wandering-horde/", "name": "Community"}], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:30.767	2025-12-28 15:24:36.385	0
scavengers-of-the-living-dead	Scavengers of the Living Dead	5.5.1	JaxTeller718	\N	What Scavengers is is a tribute to traditional and classic zombie horror survival. If Ravenhearst is the Resident Evil of mods then Scavengers will be the Night of the Living Dead. Its focus is not on horde nights, or Demolishers, or even mutations but will be on primitive survival tactics, hordes of unrelenting WALKERS and respectful of established "traditional" zombie lore (no runners, headshots kill etc).\nThe challenge of this mod for me as we go forward is to make it as difficult as possible yet be something completely unexpected and different than what you would expect from 7 Days. We have Ravenhearst for the kitchen sink type of mod, this will be sleeker, meaner and rely more on natural challenges than things like bullet sponges. Building will not be the focus here, rather will be a luxury. Nomadic gameplay style and smart survival decisions will be key to your survival. Zombies will be enhanced with several new "sniffing out" techniques that could very quickly spell trouble for you in short order if you get overwhelmed. The gameplay will feel very similar in style to older Alphas, with less focus on points and perks and way more focus on crafting, resource gathering and scavenging of course.	active	A20	\N	f	{}	{}	{"discord": "https://discord.gg/XWphRtm", "download": "https://gitlab.com/jaxteller718/scavengersa20/-/archive/main/scavengersa20-main.zip", "community": [{"url": "https://forums.7daystodie.com/forum/-7-days-to-die-pc/game-modification/mods/164590-scavengers-of-the-living-dead", "name": "Forums"}, {"url": "https://account.venmo.com/u/JaxTeller718", "name": "Account"}], "donations": [{"url": "https://www.paypal.me/FrankCirabisiJr", "name": "Paypal"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	1	{}	2025-12-28 15:12:29.533	2026-01-30 09:22:00.406	0
war3zuk-farmlife	War3zuk FarmLife	4.0	War3zuk	\N	War3zuk Farmlife 2025 Vanilla Install V1.4 B8 (This is a standalone installer version and is NOT to be used along side my main War3zuk Overhaul)\nThis Mod is a complete overhaul and update of the original Farmlife from alpha 17 that was discontinued when it became so out of date it was un-usable.. This overhaul has a complete array of custom trees, Plants And its own models all paid for by myself so that the mod is as nice looking as possible.. You have a full selection of Seeds, Fruits, Berries and so on so you can make lots of different types of foods to compliment the main game.You can craft and build an entire farm along with custom animals, Benches and so on. Learning curve is a little steep but well worth it if your into Farming	active	V1.4	\N	f	{}	{}	{"discord": "", "download": "https://dev.azure.com/war3zuk/_git/War3zuk-FarmLife-Vanilla-Install-Latest-Stable", "community": [], "donations": []}	{"review": "https://youtu.be/B7QrihbQezs", "trailer": "https://youtu.be/Xk6LS1jD3zE"}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:45.826	2025-12-28 15:19:17.474	0
winterween	Winterween	21.2.18.951	SphereII	\N	Welcome to the Winterween Project by sphereii and xyth, the unholy combination of Winter Project and the ancient Valoween!\nSteel your nerves. Steady your hands. Keep your wits about you, and you just may survive Winterween...\nWe invite you to once more explore a special sphereii-mental release, and challenge yourself to unlock its secrets.	active	V1.3	\N	f	{}	{}	{"discord": "https://discord.gg/RYDwtHstzX", "download": "https://github.com/SphereII/Winterween", "community": [], "donations": []}	{"review": "https://youtu.be/eFDt-DR3xDk", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:51.299	2025-12-28 15:19:22.935	0
wild-west	Wild West	298f8e0	Tallman Brad, arramus	\N	The Wild West Mod rolls back time to around the Mid 19th Century Wild West America (+/- 20 years). It attempts to remove features which are not time appropriate, and introduce additional features to expand and complement the overall experience. There are over 100 custom POIs with split into those being placed within the Old West type tileset for Towns, and hand placed POIs out of Town and in the Wilderness.	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/BxDP7Tam8H", "download": "https://www.nexusmods.com/7daystodie/mods/8007", "community": [{"url": "https://github.com/OAKRAVEN1/V2-WildWestMod", "name": "GitHub"}, {"url": "https://community.7daystodie.com/topic/38173-v1-wild-west-mod/", "name": "Community"}], "donations": []}	{"review": "https://youtu.be/krOZZXTqzzU", "trailer": "https://youtu.be/2CQfQVVHqEg"}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/8624", "code": "Russian", "name": "Russian", "type": "external"}]	0	0	0	0	{}	2025-12-28 15:12:49.948	2025-12-28 15:24:38.043	0
your-end	Your End	2.4.0.2	DJ Triple XMR	\N	It is a revision mod where the game is modified by 80% and created by DJ TRIPLE XMR, we are increasingly changing the style of play adding ease and difficulty at the same time, with each patch improving the appearance and differentiating the way of playing with the previous patch.	active	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/4npXj5fmAF", "download": "https://7daystodiemods.com/your-end/", "community": [], "donations": [{"url": "https://paypal.me/Djtriplexmr", "name": "Paypal"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"code": "Spanish", "name": "Spanish", "type": "builtin"}]	0	0	0	1	{}	2025-12-28 15:12:52.815	2025-12-28 15:33:13.611	0
sorcery-mod	Sorcery mod	1.942	Sorcery Team	\N	Sorcery mod is a mod for 7 Days to Die.	active	A21	\N	f	{}	{}	{"discord": "https://discord.gg/VH9E78xfhx", "download": "https://discord.gg/8JCVQydB5h", "community": [], "donations": []}	{"review": "https://youtu.be/RBnZ-LAtg-w", "trailer": "https://youtu.be/UYaPnOu65Mc"}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:19:02.178	2025-12-30 13:12:43.95	0
preppocalypse	Preppocalypse	1.4.0.1	arramus	\N	Preppocalypse is an expansion for 7 Days to Die, from the perspective of a Prepper. In the context of 7 Days to Die, a Prepper is a survivor who prepared in advance for adverse situations and made it through the initial ‘event’ stage and aftermath. Preppocalypse places the player in the subsequent afterwards.\nDue to vigilance from before the initial ‘event’, a Prepper already has some features in place. These include increased inventory capacity, enhanced skill potential and choice, and access to other benefits considered helpful for survival. Preppocalypse recognizes a Prepper has an increased chance to thrive. As a tradeoff, in addition to the grunt, feral, and radiated hostile classes, there are ‘others’ out there to provide a more challenging and hostile environment. They will mostly be seen as game stage progresses, but be prepared for some surprises during Horde Night or in the biomes. This expansion builds on the post-apocalyptic theme of 7 Days to Die through an additive approach. As such, the majority of features will be very familiar. Additions are intuitive, enhancing, immersive, in context, supportive, and appropriately more threatening. While there will be periods of extremes, considered choices can restore balance.	active	V1.4	\N	f	{}	{}	{"discord": "", "download": "https://www.nexusmods.com/7daystodie/mods/5295", "community": [{"url": "https://community.7daystodie.com/topic/31960-preppocalypse/", "name": "Community"}], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:19.546	2025-12-28 15:24:45.816	0
ravenhearst	Ravenhearst	10.4.1b1	JaxTeller718	\N	Welcome to Ravenhearst a place where your nightmares grow and fester and the world around you is trying to kill you at every turn. Ravenhearst is a full overhaul mod that uses the amazing 7 Days to Die and turns expectations in its head. Every aspect of the vanilla game has been tweaked or tuned to increase challenge and difficulty. Ravenhearst has often been called the mod that is not for everyone. It is best played by those that have a basic understanding of the vanilla 7 Days to Die experience, and for those looking to challenge themselves. Below you will learn just a little bit about what we have to offer. Keep in mind that Ravenhearst, just like the actual 7 Days to Die game, is nowhere a near finished experience and it's development is ongoing, and as such should be played with the open mind that there can be major updates that will cause save breaks and resets to your game. We pride ourselves on using our team of testers to thoroughly play and beg test so that we can provide you with the most solid gaming experience we can manage to put forth. But also keep in mind as with anything, things can happen.	on_hold	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/2ypkgwDEkp", "download": "https://www.nexusmods.com/7daystodie/mods/135", "community": [{"url": "https://www.mediafire.com/file/jhqolldzlofbo9t/Ravenhearst_10_4_1b1.zip/file", "name": "MediaFire"}, {"url": "https://community.7daystodie.com/topic/4508-ravenhearst-mod/", "name": "Community"}], "donations": []}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/2741", "code": "Russian", "name": "Russian", "type": "external"}, {"url": "https://7daystodiemods.com/translation-portuguese-brazil-mod-ravenhearst/", "code": "Portugese", "name": "Portugese", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/3470", "code": "Ukrainian", "name": "Ukrainian", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/4676", "code": "Chinese", "name": "Chinese", "type": "external"}]	0	0	0	0	{}	2025-12-28 15:12:21.994	2025-12-28 15:24:47.896	0
back-to-origins	Back To Origins	6.08	RaDee	\N	BTO is a comprehensive overhaul mod for *7 Days to Die* that significantly enhances and complicates nearly every aspect of the game, making it more immersive, challenging, and diverse.\nThe mod reworks biomes, turning environmental hazards like overheating or frostbite into life-threatening concerns rather than mere inconveniences. The Wasteland has become completely uninhabitable due to persistent, deadly radiation levels, requiring specialized protective gear to survive. However, venturing into this hostile zone is worth the risk, as it’s the only place to find titanium—a rare and incredibly durable metal that has surfaced there for unknown reasons.\nTo help you survive, BTO introduces a massive arsenal of weapons, crafted by the mod’s creator, RaDee, using models from open sources, as well as contributions from the renowned weapon pack creator Izayo. But that’s just the beginning. At the start of the game, you can choose your character’s backstory—soldier, farmer, wanderer, or more—each shaping your journey and skills, letting you decide who you’ll become in this post-apocalyptic world.\nBecome a legend with the mod’s legendary skill system, master crafting with an expanded crafting system, take to the skies by repairing a helicopter, or live a quieter life by the sea with an overhauled gardening and animal husbandry system.\nThis and much more awaits you in BTO.	active	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/QWNrA5WwBn", "download": "https://www.nexusmods.com/7daystodie/mods/4899", "community": [{"url": "https://drive.google.com/file/d/1h6-CBBq-GWRGX4P7p1AAPp90nR-uCnES/view?usp=sharing", "name": "Google Docs"}, {"url": "https://disk.yandex.ru/d/CrZHUNFbPKBO0Q", "name": "Яндекс Диск"}, {"url": "https://mega.nz/file/fQxGHKTC#hitvqTRMuLQ7v3vo4Ltmq0GhDtW70V92XoY0WM32eQM", "name": "10.57 GB file on MEGA"}, {"url": "https://drive.google.com/file/d/16v1oLQyTl-Nx3c5Nfzq1Wx9VjGBFbaQ1/view?usp=sharing", "name": "Drive"}, {"url": "https://www.youtube.com/channel/UCiqBsc_cysDq_jYBsocJKQg", "name": "YouTube"}, {"url": "https://trovo.live/_RaDee_", "name": "Trovo"}], "donations": [{"url": "https://boosty.to/radeechannel", "name": "Boosty"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"code": "Russian", "name": "Russian", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:11:55.41	2025-12-28 15:33:13.718	0
undead-legacy	Undead Legacy	2.6.17	Subquake	\N	Undead Legacy is an overhaul mod for 7 Days to Die with main focus on improving quality of life features, immersion and expanding content in a meaningful way with additional complexity layer with lots of new items, blocks, recipes, prefab changes and more!\nIt's developed by 1 person - [Subquake](https://ul.subquake.com/subquake) with a little help of other community members in smaller things. You can read in more detail about this under [Credits](https://ul.subquake.com/credits).\nMods development started during Alpha 11 of 7 Days to Die and first stable release came out in November 4th, 2017 Main inspiration comes from games like: Fallout 4, Fallen Earth, Sheltered, Project Zomboid, XCOM, Conan Exiles and others.	active	A20	\N	f	{}	{}	{"discord": "https://discord.gg/bGd5QTreUf", "download": "https://ul.subquake.com/download", "community": [{"url": "http://ul.subquake.com/", "name": "Subquake's Undead Legacy"}, {"url": "https://community.7daystodie.com/topic/4085-subquakes-undead-legacy/", "name": "Community"}, {"url": "https://www.reddit.com/r/UndeadLegacy/", "name": "The heart of the internet"}, {"url": "https://twitter.com/SubquakeLV", "name": "X"}, {"url": "https://twitch.tv/subquake", "name": "Twitch"}, {"url": "https://youtube.com/subquake", "name": "YouTube"}, {"url": "https://steamcommunity.com/id/SubquakeLV", "name": "Steam Community :: Subquake"}], "donations": [{"url": "https://patreon.com/subquake", "name": "Patreon"}, {"url": "https://paypal.me/subquake", "name": "Paypal"}]}	{"review": "https://youtu.be/OLczDFd406k", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"code": "Russian", "name": "Russian", "type": "builtin"}, {"code": "Chinese", "name": "Chinese", "type": "builtin"}, {"code": "Brazilian", "name": "Brazilian", "type": "builtin"}, {"code": "German", "name": "German", "type": "builtin"}, {"code": "Korean", "name": "Korean", "type": "builtin"}, {"code": "Polish", "name": "Polish", "type": "builtin"}, {"code": "Spanish", "name": "Spanish", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:39.445	2025-12-28 15:33:13.78	0
war-of-the-walkers	War of the Walkers	1.4.2.3	Dwallorde	\N	N/A	active	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/bQdP6cH", "download": "https://7daystodiemods.com/war-of-the-walkers-mod/", "community": [{"url": "https://github.com/dwallorde/war-of-the-walkers-exp/", "name": "GitHub"}], "donations": [{"url": "https://www.paypal.me/dwallorde", "name": "Paypal"}]}	{"review": "https://youtu.be/jNNefJDFAjU", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/4847", "code": "Ukrainian", "name": "Ukrainian", "type": "external"}]	0	0	0	0	{}	2025-12-28 15:19:14.245	2025-12-28 15:33:13.826	0
zombicide	Zombicide	1.1	Killerbunny264	\N	A mod where you go clearing the poi's one after one around the map , some of mod features , no traders , no crafting , no challenges either , there's Custom vending machines in each trader , those vending machines has everything you need , like guns , armor , ammo etc , there's one quest line , kill Zombies , 1-200 , starts with 3 zombies , up to 600 , each quest you  complete, you get coins for it , also you can sell items	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/psuz4JwXa3", "download": "https://www.nexusmods.com/7daystodie/mods/8775?tab=files", "community": [{"url": "https://www.bluefangsolutions.com/?ref=359", "name": "Bluefangsolutions"}], "donations": [{"url": "https://www.paypal.me/Killerbunny264", "name": "Paypal"}, {"url": "https://www.patreon.com/ApocalypseNowMod/", "name": "Patreon"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:54.091	2025-12-28 15:33:13.886	0
true-survival	True Survival	1.29.15	SpiderJZMOD	\N	This mod was designed to walk the line between realism and fun engaging gameplay. Where realism became grindy or not fun I tried to aim for engaging gameplay mechanics with a focus on risk and reward and a strong sense of consequences. Death in this mod is permanent with few exceptions. In this mod when death occurs your player data is wiped and you will respawn as a fresh new player.  Choosing Your Character - Upon starting, players will have Knowledge Points available to purchase up to 3 Traits, a Hobby and a Profession.  These choices will determine the players starting stats, items and recipes. Players are able to learn all Professions over time by collecting 20 Profession Pages and crafting another Professions Kit. An additional Hobby can be learned after 20 days survived. Traits do not stack and are optional. The following are the Players Starting Choices.	active	V2.3	\N	f	{}	{}	{"discord": "https://discord.gg/nEVTcMMf5x", "download": "https://discord.gg/nEVTcMMf5x", "community": [], "donations": [{"url": "https://www.paypal.com/paypalme/JohnZidar", "name": "Paypal"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:12:34.849	2025-12-28 15:33:13.934	0
gorenogodsk	Gorenogodsk	2.1.0	Grumbleman	\N	The idea of this modification has long been on the surface – to transfer the player from the realities of the US state of Arizona to an authentic town somewhere in the CIS (post-Soviet countries) with post-Soviet peculiar buildings.\nIn addition to houses, transport, weapons, and partially the appearance of zombies, and the interior will be redesigned. The gameplay, which is not related to the visual, will also undergo changes: there are plans to create new traps, including distracting ones; rebalancing weapons; creating new types (subspecies) of quests and creating quests of higher complexity than tier 5 or even 6; recoverable transport in the world; partial complexity of crafting and much more.\nAn additional idea of the mod is to make it only through xml, without additional programming and getting into the game code. There are two main reasons for this: I'm a bad coder; I don't want the mod to need special guides on how to install it, it should be enough to throw it into a folder – and that's it.\nSome plans and ideas have already been tested, have prototypes, some are only in the "in theory it should work" stage. You can get acquainted with them, as well as with the general development plan below.	active	A21	https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/banners/1766935556007-banner-1766935555757.webp	f	{}	{}	{"discord": "https://discord.gg/xD5r5f6", "download": "https://www.nexusmods.com/7daystodie/mods/2605", "community": [{"url": "https://www.youtube.com/@GamesnGrumble", "name": "YouTube"}, {"url": "https://t.me/GamesnGrumble", "name": "Telegram"}], "donations": [{"url": "https://boosty.to/gng", "name": "Boosty"}]}	{"review": "", "trailer": ""}	[{"date": "", "changes": [""], "version": "1.0.0.0"}]	[{"url": "", "code": "EN", "name": "English", "type": "builtin"}, {"code": "English", "name": "English", "type": "builtin"}, {"code": "Russian", "name": "Russian", "type": "builtin"}]	0	0	0	2	{https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766935651542-screenshot-1766935651536-0.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766935652830-screenshot-1766935652825-1.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766935653455-screenshot-1766935653449-2.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766935655241-screenshot-1766935655235-3.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766935656576-screenshot-1766935656571-4.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766935657523-screenshot-1766935657518-5.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766935658962-screenshot-1766935658957-6.webp}	2025-12-28 15:12:10.303	2025-12-29 15:03:42.466	0
the-wasteland	The Wasteland	2.4.2.2	bdubyah	\N	Welcome to **The Wasteland**! This overhaul mod adds in several new items, enemies, POIs and more! Based on the Fallout series	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/kdzkCuPZxC", "download": "https://www.nexusmods.com/7daystodie/mods/1043", "community": [{"url": "https://dev.azure.com/bdubyah/_git/The_Wasteland", "name": "Dev"}, {"url": "https://community.7daystodie.com/topic/38222-11the-wasteland/", "name": "Community"}], "donations": [{"url": "https://ko-fi.com/bdubyah", "name": "Ko-fi"}, {"url": "https://www.paypal.com/paypalme/bdubyah", "name": "Paypal"}]}	{"review": "", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/3816", "code": "Russian", "name": "Russian", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/7040", "code": "Chinese", "name": "Chinese", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/6776", "code": "Ukrainian", "name": "Ukrainian", "type": "external"}]	0	0	0	1	{}	2025-12-28 15:12:47.964	2025-12-28 15:33:13.258	0
asia-mod	Asia Mod	4.2.2002	HessenBub	\N	The Asia Mod is a far-reaching revision of 7 Days to Die. This overhaul mod has a very strong focus on survival. Therefore, you can not play this mod like the vanilla game or many other mods where you no longer have problems as soon as you can make bacon with eggs (by the way, these do not exist at all). But if you are willing to learn you find lots of detailed cooking recipes and lots of crafting possibilities.\nEverything that is put in this mod has to fit the theme of Asia in the 16th century. (there is really a lot of research in here).	on_hold	V1.4	\N	f	{}	{}	{"discord": "https://discord.gg/Nd5zXQyYTX", "download": "https://git.asia-mod.net/", "community": [{"url": "https://asia-mod.net/", "name": "Asia Mod"}, {"url": "https://youtube.asia-mod.net/", "name": "YouTube"}, {"url": "https://x.com/asiamod7days", "name": "X"}, {"url": "https://instagram.asia-mod.net/", "name": "Instagram"}], "donations": []}	{"review": "https://youtu.be/i7O646F9FUA?si=OJGNc1sBOYs9rK3J", "trailer": "https://youtu.be/YDaGNW2r6h0"}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"code": "German", "name": "German", "type": "builtin"}, {"code": "Japanese", "name": "Japanese", "type": "builtin"}, {"code": "Brazilian", "name": "Brazilian", "type": "builtin"}]	0	0	0	0	{}	2025-12-28 15:11:52.51	2025-12-28 15:33:13.381	0
war3zuk-aio-overhaul	War3zuk AIO Overhaul	v1.5	War3zuk	\N	This Mod changes around 90% of the Total game Mechanics in the sense of Code, It adds many weapons All of which have been bought from various stores to try to get the best looking and playing Mod he can manage, Its constantly being worked on and improved and should always be kept upto date with the latest version of the main core game, The AIO also adds many Blocks and Different items that require abit more learning in order to understand how it all works, A good example of this is the main weapons are no longer repaired using the default repair kits but instead use 4 Custom made varients that are crafted on the player to do with each type of gun. Some of His Original Modlets that were used to create this AIO are as follows. Around 20 or so more have been added directly to the AIO that cant be made into Modlets due to them needing certain bits of code from the AIO so would cause Conflicts	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/FcDrGvMHeT", "download": "https://7daystodiemods.com/war3zuk-aio-overhaul/", "community": [{"url": "https://dev.azure.com/war3zuk/War3zuk-AIO-Mod-Launcher-v2/_git/War3zuk-AIO-Mod-Launcher-v2", "name": "Dev"}], "donations": [{"url": "https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=S9RGW4NRARBUL&source=url", "name": "Paypal"}]}	{"review": "https://youtu.be/t1Y21UwW-lU", "trailer": ""}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/7042", "code": "Chinese", "name": "Chinese", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/6795", "code": "Ukrainian", "name": "Ukrainian", "type": "external"}]	0	0	0	0	{}	2025-12-28 15:12:44.468	2025-12-28 15:33:13.994	0
vikings-mod-to-be-released	Vikings Mod	N/A	NORDMANN	\N	May it find thee in fine spirits, warriors all! We raise our horns in gratitude, for thou art gathered here on the VIKINGS MOD Discord.\nTeaser Two be upon the horizon, as sails unfurl, and soon shalt thou behold more wonders of the VIKINGS MOD.\nThe north clan wishes thee a week most prosperous. Guard thyself well - Skål!	upcoming	N/A	https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/banners/1766942052332-banner-1766942052055.webp	f	{}	{}	{"discord": "https://discord.gg/jkY7P4U39M", "download": "", "community": [{"url": "https://community.7daystodie.com/topic/42528-vikings-mod-7d2d-leaks-teaser/", "name": "Community"}, {"url": "https://www.youtube.com/@NordicYT?sub_confirmation=1", "name": "YouTube"}, {"url": "https://www.twitch.tv/nordmann845", "name": "Twitch"}], "donations": []}	{"review": "", "trailer": "https://youtu.be/ZzhKwlbyNeQ"}	[{"date": "", "changes": [""], "version": "N/A"}]	[{"url": "", "code": "EN", "name": "English", "type": "builtin"}, {"code": "English", "name": "English", "type": "builtin"}, {"code": "German", "name": "German", "type": "builtin"}]	0	0	1	2	{https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766942992286-screenshot-1766942992279-1.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766942993557-screenshot-1766942993550-2.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766942994511-screenshot-1766942994502-3.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766942995993-screenshot-1766942995987-4.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766942997058-screenshot-1766942997049-5.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766942998062-screenshot-1766942998054-6.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766942999273-screenshot-1766942999266-7.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766942990738-screenshot-1766942990731-0.webp}	2025-12-28 15:12:42.59	2026-01-30 09:21:26.383	0
age-of-oblivion	Age of Oblivion	A7.1	Pipermac	\N	This project started with myself taking over the [Farm Life Expanded](https://7daystodiemods.com/farm-life-expanded/) mod. I first start to fix thing with the mod but as I began to learn more about modding I decided that rather then trying to fix it would be best to rebuild. What started a “Farming” mod has now become so much more.\nWelcome to “**The Age of Oblivion**”!	active	A21	https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/banners/1766936676627-banner-1766936675908.webp	f	{}	{}	{"discord": "https://discord.gg/hBqXBTbjTV", "download": "https://7daystodiemods.com/age-of-oblivion/", "community": [{"url": "https://ageofoblivion.com/", "name": "Ageofoblivion"}, {"url": "https://community.7daystodie.com/topic/23943-age-of-oblivion-alpha-710212-stable-a212/", "name": "Community"}], "donations": []}	{"review": "https://youtu.be/Pm-lREf8QtQ", "trailer": "https://www.youtube.com/watch?v=UKWNN9OE7r8"}	[{"date": "", "changes": [""], "version": "1.0.0.0"}]	[{"url": "", "code": "EN", "name": "English", "type": "builtin"}, {"code": "English", "name": "English", "type": "builtin"}]	0	0	0	5	{https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936894805-screenshot-1766936894317-5.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936892664-screenshot-1766936892170-3.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936893819-screenshot-1766936893411-4.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936891676-screenshot-1766936891266-2.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936896214-screenshot-1766936895910-7.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936890081-screenshot-1766936889676-0.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936895614-screenshot-1766936895314-6.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936890936-screenshot-1766936890625-1.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936896796-screenshot-1766936896503-8.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766936897275-screenshot-1766936897067-9.webp}	2025-12-28 15:11:50.357	2026-02-19 13:56:41.544	0
i-am-legend	I am Legend	2.0.0	Hells Janitor	\N	Six billion people on Earth when the infection hit...\nThe Krippin Virus had a 90 percent kill rate; that's 5.4 BILLION people, dead. Crashed and bled out. Dead. Less than one-percent immunity.\nThat left 12 million healthy people, like you. The other 588 MILLION turned into Dark Seekers, and then they got hungry, and they killed and fed on everybody. **EVERYBODY!**\nEvery single person that you or I has ever known is dead! DEAD!\n**THERE IS NO GOD!**\nZombies (Dark Seekers) DO NOT spawn in the wild during the day. You are free to move about the world, but be warned...\nBuildings are DANGEROUS. They are filled with fast-moving enemies, and you'll need to be careful when looking for supplies.\nThere are no traders; all trader compounds have been abandoned.\nWhen night falls, you'll want to be inside and well hidden. Dark Seekers will be out in force, and they're hungry	unknown	V1	https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/banners/1766965594418-banner-1766965594411.webp	f	{}	{}	{"discord": "https://discord.gg/GTQecRSMjM", "download": "https://7daystodiemods.com/i-am-legend/", "community": [{"url": "https://community.7daystodie.com/topic/35153-i-am-legend/", "name": "Community"}, {"url": "https://www.youtube.com/c/Hells_Janitor", "name": "YouTube"}, {"url": "https://www.twitch.tv/hellsjanitortv", "name": "Twitch"}, {"url": "https://twitter.com/HellsJanitorTV", "name": "X"}, {"url": "https://kick.com/hellsjanitor", "name": "Kick"}], "donations": []}	{"review": "", "trailer": ""}	[{"date": "", "changes": [""], "version": "1.0.0.0"}]	[{"url": "", "code": "EN", "name": "English", "type": "builtin"}, {"code": "English", "name": "English", "type": "builtin"}]	0	0	0	1	{https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766965601556-screenshot-1766965601549-0.webp}	2025-12-28 15:12:12.81	2025-12-28 23:46:49.855	0
echoes-from-the-afterlife	Echoes from the afterlife	v1.0	Redbeard	\N	<p>Afterlife is a hardcore, immersive survival overhaul for 7 Days to Die that emphasizes exploration, resource management, and a unique action skill progression system. It features reworked biomes, a new vitality system, custom equipment slots, expanded crafting tiers, and a plethora of new weapons and tools.</p>	unknown	V1.4	https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/banners/1766840524867-banner-1766840524860.webp	f	{"- Full \\"action skill\\" system. All attributes and skills are action skills. There are no traditional levels.","- All perks are new/custom.","- No time, compass, or map to start with. These items must be acquired.","- No traders or quests (for now; an alternative is being worked on).","- Vitality system. A \\"general well-being\\" resource that can be managed in many ways.","- Reworked biomes (forest and desert in particular).","- Reworked world lighting.","- Wasteland megacity (make sure you use RWG with the mod running).","- Several classes and class selection on game start.","- Custom equipment slots including torch, backpack, watch, map, and compass.","- 3 new tool/weapon tiers including scrap, bronze, and inconel.","- Izayo's weapon packs, so lots and lots of guns (fully integrated with progression).","- UI rework.","- 6 new \\"mineables\\".","- Forge heat system.","- Permanent infection (don't worry, it's manageable).","- Quantity/liquid storage system using glass jars as main item container.","- Weight + backpack capacity inventory system.","- \\"Dye Tub\\" enabling crafting of 512 different dye colours.","- \\"Cartography Table\\" for sharing map information with allies.","- \\"Training Dummy\\" for when you're too scared to go out at night.","- Improved rain effects.","- Some optimisations to try and squeeze a bit more FPS out of the game.","- Blueprint-based building system.","- Various QoL hotkeys (can be seen in-game in the vanilla \\"info panel\\").","And lots of other stuff!"}	{"Download the mod file.","Extract the archive to your 7 Days to Die 'Mods' folder.","Verify the folder structure: 'Mods/ModName/ModInfo.xml'.","Start the game."}	{"discord": "", "download": "https://gitlab.com/teamafterlife/afterlife-echoes-2.x", "community": [], "donations": [{"url": "https://www.youtube.com/@redbeardtt", "name": "YouTube"}]}	{"review": "", "trailer": ""}	[{"date": "2025-12-15T21:00:00.000Z", "changes": [""], "version": "1.0.0.0"}]	[{"code": "EN", "name": "English", "type": "builtin"}]	0	0	0	5	{https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1766840547493-screenshot-1766840547485-0.webp}	2025-12-27 13:23:19.147	2026-02-19 13:57:19.046	0
rebirth	Rebirth	2.0	FuriousRamsay	\N	Rebirth is a comprehensive overhaul mod for 7 Days to Die, designed to enhance and expand the survival experience. Known for its challenging gameplay and extensive feature set, Rebirth introduces new mechanics, enemies, and a deep customization system that allows players to adjust nearly every aspect of the game. The mod rebalances core elements while adding fresh content, making it a favorite among players seeking a more intense and rewarding survival challenge.	active	V2.4	\N	f	{}	{}	{"discord": "https://discord.gg/zamjP9bD5x", "download": "https://drive.google.com/file/d/18lQQtDXnMhbQ7CeojN4DrdtAfPzdY9dS/view?usp=sharing", "community": [{"url": "https://discord.com/channels/853417090400911391/1433890409297477743/1433893394148495511", "name": "Discord"}, {"url": "https://www.youtube.com/channel/UCQ2R7sAShu2eaxQsrAFLAIw", "name": "YouTube"}, {"url": "https://7d2d-rebirth-mod.fandom.com/wiki/7D2D_Rebirth_Mod_Wiki", "name": "7D2D Rebirth Mod Wiki"}], "donations": [{"url": "https://www.patreon.com/furiousramsay", "name": "Patreon"}, {"url": "https://www.paypal.com/donate/?hosted_button_id=3PRTM3QVRXUX2", "name": "Paypal"}]}	{"review": "https://youtu.be/v6CPf9YevDU", "trailer": "https://youtu.be/KkruwZA5PhA"}	[]	[{"code": "English", "name": "English", "type": "builtin"}, {"code": "Russian", "name": "Russian", "type": "builtin"}, {"code": "German", "name": "German", "type": "builtin"}, {"code": "Spanish", "name": "Spanish", "type": "builtin"}, {"code": "French", "name": "French", "type": "builtin"}, {"code": "Italian", "name": "Italian", "type": "builtin"}, {"code": "Japanese", "name": "Japanese", "type": "builtin"}, {"code": "Korean", "name": "Korean", "type": "builtin"}, {"code": "Polish", "name": "Polish", "type": "builtin"}, {"code": "Portugese", "name": "Portugese", "type": "builtin"}, {"code": "Turkish", "name": "Turkish", "type": "builtin"}, {"code": "Chinese", "name": "Chinese", "type": "builtin"}, {"code": "Spanish", "name": "Spanish", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/6463", "code": "Ukrainian", "name": "Ukrainian", "type": "external"}]	0	0	0	1	{}	2025-12-28 15:12:27.425	2025-12-29 15:04:21.357	0
outback-roadies	Outback Roadies	2.5.0.0	arramus	\N	<p>The (V2) Outback Roadies Mod is an expansion for 7 Days to Die with an Australian theme.<br>The concept has a bit of a Mad Max type post-poco feel about it and includes a 7D2D version of 'The Compound' POI from Mad Max II.<br>SpecBytes from SpecBytes Gaming requested the hostile Australian themed animals and the EndZ team kindly assisted</p>	active	V2.4	https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/banners/1767099108861-banner-1767099108648.webp	f	{"- Custom Entities and Vehicles from the EndZ creators May Red and Thee Legion","- 10K Australia World by Fluffy Panda with custom features specific for Outback Roadies (Optional files area)","- Integration for the NPC Mod and includes Spider Add On Pack","- Community Quality of Life Mods","- Optional Mods folder with larger backpack, Izy's Gun Pack, and other customising features","- Custom Aussie recipes for greater immersion","- Additional Game Menu option value features such as 96 Entity Horde Night","- and a few other bits..."}	{"Add to your Mods folder. Check requirements for Fluffy Panda's Outback Roadies Australia 10K World."}	{"discord": "https://discord.gg/PFMY8rqQVs", "download": "https://www.nexusmods.com/7daystodie/mods/8029", "community": [], "donations": []}	{"review": "https://youtu.be/p5u5pH1U8Xo", "trailer": ""}	[{"date": "", "changes": [""], "version": "1.0.0.0"}]	[{"url": "", "code": "EN", "name": "English", "type": "builtin"}, {"code": "English", "name": "English", "type": "builtin"}]	0	0	0	1	{https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1767099149974-screenshot-1767099149968-0.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1767099150889-screenshot-1767099150883-1.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1767099151736-screenshot-1767099151729-2.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1767099152801-screenshot-1767099152795-3.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1767099153600-screenshot-1767099153593-4.webp,https://kajgltp6jtmm7ijy.public.blob.vercel-storage.com/screenshots/1767099154600-screenshot-1767099154595-5.webp}	2025-12-28 15:12:18.347	2025-12-30 12:56:26.47	0
district-zero	District Zero	v1.2	Zilox	\N	In a dystopian world ravaged by zombies, robots were deployed with strict orders to eliminate any signs of life to try and contain the outbreak. As a result, many remaining survivors that had not been infected were wiped out and the animals that once roamed the grasslands became extinct. The year is now 2034 and the zombie outbreak still rages across the wastelands fuelled by a mysterious glow that keeps the undead alive. Inspired by sci-fi games such as Generation Zero, Prey and Detroit: Become Human.	active	V1.2	\N	t	{}	{}	{"discord": "https://discord.gg/5HrpRdGxKd", "download": "https://www.nexusmods.com/7daystodie/mods/3174", "community": [{"url": "https://7daystodiemods.com/district-zero/", "name": "7 Days to Die Mods"}, {"url": "https://dev.azure.com/Zilox135/_git/DistrictZeroV2.3", "name": "Dev"}, {"url": "https://community.7daystodie.com/topic/32797-district-zero/", "name": "Community"}], "donations": [{"url": "https://www.paypal.com/donate/?hosted_button_id=S96TPW9B2MSBW", "name": "Paypal"}]}	{"review": "https://youtu.be/qd_1psz1EfQ", "trailer": ""}	[{"date": "2025-12-24T21:00:00.000Z", "changes": ["<p>Все живы</p><p>Все живы<br>Точно<br>Не вру</p>"], "version": "v1.2", "isSaveBreaking": true}]	[{"code": "English", "name": "English", "type": "builtin"}, {"url": "https://www.nexusmods.com/7daystodie/mods/7041", "code": "Chinese", "name": "Chinese", "type": "external"}, {"url": "https://www.nexusmods.com/7daystodie/mods/6041", "code": "Spanish", "name": "Spanish", "type": "external"}]	0	0	0	2	{}	2025-12-28 15:12:03.172	2026-01-30 09:21:38.706	0
\.


--
-- Data for Name: ModSubmission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ModSubmission" (id, title, slug, version, author, description, "gameVersion", "bannerUrl", "isSaveBreaking", features, "installationSteps", links, videos, changelog, localizations, screenshots, tags, "submitterId", "submitterNote", status, "rejectionReason", "submittedAt", "reviewedAt") FROM stdin;
\.


--
-- Data for Name: ModTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ModTag" ("modId", "tagId", "isExternal", "externalLink") FROM stdin;
echoes-from-the-afterlife	cmjpvawfc0000egateou1h6c1	f	\N
forsaken-trail	cmjifk4t6000404l4ry2obfui	f	\N
advanced-survival-overhaul	cmjqdpaga0006r0at3pmv8940	f	\N
vikings-mod-to-be-released	cmjpvbl1o000wegatbiu9088j	f	\N
never-alone	24ca9883-029c-4034-adab-74872a3a52de	f	\N
vikings-mod-to-be-released	e5ab614f-1545-44a3-8eef-af58d5ce6e65	f	\N
i-am-legend	24ca9883-029c-4034-adab-74872a3a52de	f	\N
echoes-from-the-afterlife	24ca9883-029c-4034-adab-74872a3a52de	f	\N
outback-roadies	cmjifk4ik000204l4vbq70ch0	f	\N
outback-roadies	cmjpvb84c000hegate6tbnffw	t	https://www.nexusmods.com/7daystodie/mods/9179
outback-roadies	cmjpvbm7z000yegat7reeg0vy	f	\N
outback-roadies	cmjphquha000bp8atwem7zz6s	f	\N
outback-roadies	cmjqxxhaw000avgat7qi7z0c7	f	\N
outback-roadies	cmjslbmix0002msatot4jbyzl	f	\N
outback-roadies	cmjrl5qwy0000q0atmivch07s	f	\N
28-alphas-later	cmjphqs1v0008p8at8tv6qruu	f	\N
28-alphas-later	cmjpvawfc0000egateou1h6c1	f	\N
5th-day	cmjrl5qwy0000q0atmivch07s	f	\N
advanced-survival-overhaul	cmjsndnu000006watd1atvjpf	f	\N
advanced-survival-overhaul	cmjrl5qwy0000q0atmivch07s	f	\N
apocalypse-now	cmjsndp6600026watpt608vrv	f	\N
apocalypse-now	d4d328eb-9989-4d17-a507-2a05bccbe7e5	f	\N
asia-mod	d4d328eb-9989-4d17-a507-2a05bccbe7e5	f	\N
the-asylum	cmjrl5qwy0000q0atmivch07s	f	\N
back-to-origins	cmjrl5qwy0000q0atmivch07s	f	\N
black-forrest	cmjrl5qwy0000q0atmivch07s	f	\N
cloud-mod	cmjsndsgs00036wat2n07d4av	f	\N
cloud-mod	cmjrl5qwy0000q0atmivch07s	f	\N
darkness-falls	cmjrl5qwy0000q0atmivch07s	f	\N
district-zero	cmjphqv6l000dp8atpssdvmx7	f	\N
district-zero	cmjpvb8uu000iegatamo9e1ox	f	\N
district-zero	cmjrl5qwy0000q0atmivch07s	f	\N
endz	cmjrl5qwy0000q0atmivch07s	f	\N
escape-from-tarkov	cmjrl5qwy0000q0atmivch07s	f	\N
forsaken-trail	cmjrl5qwy0000q0atmivch07s	f	\N
gorenogodsk	cmjrl5qwy0000q0atmivch07s	f	\N
greys-prophesy	cmjrl5qwy0000q0atmivch07s	f	\N
joke-mod	cmjrl5qwy0000q0atmivch07s	f	\N
nord-army	cmjrl5qwy0000q0atmivch07s	f	\N
preppocalypse	cmjrl5qwy0000q0atmivch07s	f	\N
ravenhearst	d4d328eb-9989-4d17-a507-2a05bccbe7e5	f	\N
rebirth	cmjrl5qwy0000q0atmivch07s	f	\N
rebirth	cmjpvb84c000hegate6tbnffw	t	https://www.nexusmods.com/7daystodie/mods/6463
scavengers-of-the-living-dead	cmjsne4qs00056watkxa9nezz	f	\N
scavengers-of-the-living-dead	cmjrl5qwy0000q0atmivch07s	f	\N
silent-hill	d4d328eb-9989-4d17-a507-2a05bccbe7e5	f	\N
smrgsbord	bf85f445-a69e-47b7-a310-2ca99f7a0bde	f	\N
sorcery-mod	cmjsndohu00016watnmsrnrk5	f	\N
sorcery-mod	cmjrl5qwy0000q0atmivch07s	f	\N
tongo-mod	cmjrl5qwy0000q0atmivch07s	f	\N
true-survival	cmjrl5qwy0000q0atmivch07s	f	\N
undead-country	cmjrl5qwy0000q0atmivch07s	f	\N
undead-legacy	cmjrl5qwy0000q0atmivch07s	f	\N
undead-water-two	cmjrl5qwy0000q0atmivch07s	f	\N
war-of-the-walkers	cmjpvkhya0002gkatsds6um0l	f	\N
war-of-the-walkers	cmjpvawfc0000egateou1h6c1	f	\N
war-of-the-walkers	cmjrl5qwy0000q0atmivch07s	f	\N
war-of-the-walkers	cmjifk4ik000204l4vbq70ch0	f	\N
war-of-the-walkers	cmjpvb84c000hegate6tbnffw	t	https://www.nexusmods.com/7daystodie/mods/4847
war3zuk-aio-overhaul	cmjphqti7000ap8at1g8jjlbr	f	\N
war3zuk-aio-overhaul	cmjphquha000bp8atwem7zz6s	f	\N
war3zuk-aio-overhaul	cmjrl5qwy0000q0atmivch07s	f	\N
war3zuk-aio-overhaul	cmjifk4ik000204l4vbq70ch0	f	\N
war3zuk-aio-overhaul	cmjpvb9kl000jegatjgx0ux1f	t	https://www.nexusmods.com/7daystodie/mods/7042
war3zuk-aio-overhaul	cmjpvb84c000hegate6tbnffw	t	https://www.nexusmods.com/7daystodie/mods/6795
war3zuk-farmlife	cmjphqti7000ap8at1g8jjlbr	f	\N
war3zuk-farmlife	cmjpvawfc0000egateou1h6c1	f	\N
war3zuk-farmlife	cmjrl5qwy0000q0atmivch07s	f	\N
war3zuk-farmlife	cmjifk4ik000204l4vbq70ch0	f	\N
the-wasteland	cmjphv5ff0000w8at5qnaytf1	f	\N
the-wasteland	cmjphquha000bp8atwem7zz6s	f	\N
the-wasteland	cmjrl5qwy0000q0atmivch07s	f	\N
the-wasteland	cmjifk4ik000204l4vbq70ch0	f	\N
the-wasteland	cmjpvb9kl000jegatjgx0ux1f	t	https://www.nexusmods.com/7daystodie/mods/7040
the-wasteland	cmjpvb84c000hegate6tbnffw	t	https://www.nexusmods.com/7daystodie/mods/6776
wild-west	cmjpvc986001gegatkdwuxhxr	f	\N
wild-west	cmjpvbm7z000yegat7reeg0vy	f	\N
wild-west	cmjphquha000bp8atwem7zz6s	f	\N
wild-west	cmjrl5qwy0000q0atmivch07s	f	\N
wild-west	cmjifk4ik000204l4vbq70ch0	f	\N
wild-west	cmjifk4t6000404l4ry2obfui	t	https://www.nexusmods.com/7daystodie/mods/8624
winterween	cmjpvcapm001iegat04olz3xs	f	\N
winterween	cmjrpnsud0001b8at3ke4cpua	f	\N
winterween	cmjrl5qwy0000q0atmivch07s	f	\N
winterween	cmjifk4ik000204l4vbq70ch0	f	\N
your-end	cmjpvcbnp001jegat5bv1gdlj	f	\N
your-end	cmjpvawfc0000egateou1h6c1	f	\N
your-end	cmjrl5qwy0000q0atmivch07s	f	\N
your-end	cmjifk4ik000204l4vbq70ch0	f	\N
your-end	cmjifk4nv000304l4k5rtq2zj	f	\N
zombicide	cmjpvbuv70017egatqsu9rz34	f	\N
zombicide	cmjphquha000bp8atwem7zz6s	f	\N
zombicide	cmjrl5qwy0000q0atmivch07s	f	\N
zombicide	cmjifk4ik000204l4vbq70ch0	f	\N
gorenogodsk	cmjoue3yt000lsgatk2tq53vv	f	\N
gorenogodsk	cmjoue3vf000ksgatkniewo88	f	\N
gorenogodsk	cmjqxxhaw000avgat7qi7z0c7	f	\N
gorenogodsk	cmjqxxhdg000bvgatp7dvipk8	f	\N
gorenogodsk	cmjqxxhgg000cvgatg3v9accn	f	\N
28-alphas-later	cmjrpnsud0001b8at3ke4cpua	f	\N
28-alphas-later	cmjrl5qwy0000q0atmivch07s	f	\N
28-alphas-later	cmjifk4ik000204l4vbq70ch0	f	\N
5th-day	cmjpvaxle0002egatdpbubo4k	f	\N
5th-day	cmjpvaxcu0001egatdby6l664	f	\N
5th-day	cmjifk4ik000204l4vbq70ch0	f	\N
cloud-mod	cmjphquha000bp8atwem7zz6s	f	\N
advanced-survival-overhaul	cmjpvayiu0004egatdkxpfre8	f	\N
advanced-survival-overhaul	cmjifk4ik000204l4vbq70ch0	f	\N
scavengers-of-the-living-dead	cmjpvbzob001degatce2666or	f	\N
sorcery-mod	cmjpvbelm000qegat06jfrjg5	f	\N
apocalypse-now	cmjpvbzob001degatce2666or	f	\N
vikings-mod-to-be-released	cmjifk4ik000204l4vbq70ch0	f	\N
vikings-mod-to-be-released	cmjpvb14f0007egat5dpugalt	f	\N
vikings-mod-to-be-released	cmjpvbk2o000vegatvbl7w8mj	f	\N
echoes-from-the-afterlife	cmjifk4ik000204l4vbq70ch0	f	\N
echoes-from-the-afterlife	cmjifk4nv000304l4k5rtq2zj	t	https://www.nexusmods.com/7daystodie/mods/7179
echoes-from-the-afterlife	cmjifk4t6000404l4ry2obfui	t	https://www.nexusmods.com/7daystodie/mods/6517
echoes-from-the-afterlife	cmjifk47z000004l48rbn65iz	f	\N
echoes-from-the-afterlife	cmjifk4d9000104l48eacx387	f	\N
echoes-from-the-afterlife	cmjifk543000604l4xopjepiz	f	\N
echoes-from-the-afterlife	cmjifk59g000704l4jl98e1u2	f	\N
echoes-from-the-afterlife	cmjifk5jz000904l48lqmgn6e	f	\N
echoes-from-the-afterlife	cmjifk5pc000a04l48gsu8uxx	f	\N
echoes-from-the-afterlife	cmjifk5un000b04l4ysc7pb9o	f	\N
echoes-from-the-afterlife	cmjifk5zy000c04l468pblpn8	f	\N
echoes-from-the-afterlife	cmjifk657000d04l44a86q6la	f	\N
echoes-from-the-afterlife	cmjifmy6z000204lggtxvplot	f	\N
echoes-from-the-afterlife	cmjoue3vf000ksgatkniewo88	f	\N
echoes-from-the-afterlife	cmjoue3yt000lsgatk2tq53vv	f	\N
echoes-from-the-afterlife	cmjouh9eh000msgatz71rjv77	f	\N
gorenogodsk	cmjpvbeu7000regat31b56zyv	f	\N
gorenogodsk	cmjifk4ik000204l4vbq70ch0	f	\N
gorenogodsk	cmjifk4t6000404l4ry2obfui	f	\N
silent-hill	cmjpvbuv70017egatqsu9rz34	f	\N
silent-hill	cmjifk4ik000204l4vbq70ch0	f	\N
smrgsbord	cmjpvbvtf0019egatzkvsekcz	f	\N
smrgsbord	cmjpvbvku0018egatw9edh8br	f	\N
smrgsbord	cmjifk4ik000204l4vbq70ch0	f	\N
sorcery-mod	cmjpvk8wm0001gkats3xh94i2	f	\N
sorcery-mod	cmjifk4ik000204l4vbq70ch0	f	\N
tongo-mod	cmjpvbwrs001aegath1ztysvk	f	\N
tongo-mod	cmjpvbvku0018egatw9edh8br	f	\N
tongo-mod	cmjifk4ik000204l4vbq70ch0	f	\N
tongo-mod	cmjifk4nv000304l4k5rtq2zj	f	\N
true-survival	cmjpvby0n001begatdudh935v	f	\N
true-survival	cmjpvbvku0018egatw9edh8br	f	\N
true-survival	cmjifk4ik000204l4vbq70ch0	f	\N
undead-country	cmjpvbyyr001cegatlfoebjti	f	\N
undead-country	cmjphquha000bp8atwem7zz6s	f	\N
undead-country	cmjifk4ik000204l4vbq70ch0	f	\N
undead-legacy	cmjpvbzwx001eegatgwak2wti	f	\N
undead-legacy	cmjpvbzob001degatce2666or	f	\N
undead-legacy	cmjifk4ik000204l4vbq70ch0	f	\N
undead-legacy	cmjifk4t6000404l4ry2obfui	f	\N
undead-legacy	cmjpvb9kl000jegatjgx0ux1f	f	\N
undead-legacy	cmjpvb1li0009egatkefen8v3	f	\N
undead-legacy	cmjpvb14f0007egat5dpugalt	f	\N
undead-legacy	cmjpvbr3r0013egatxc2ljw2x	f	\N
undead-legacy	cmjpvbrcb0014egat3g3nlwaz	f	\N
undead-legacy	cmjifk4nv000304l4k5rtq2zj	f	\N
undead-water-two	cmjpvc2tx001fegatun0yoxqy	f	\N
undead-water-two	cmjpvaxcu0001egatdby6l664	f	\N
undead-water-two	cmjifk4ik000204l4vbq70ch0	f	\N
the-wasteland	cmjifk4t6000404l4ry2obfui	t	https://www.nexusmods.com/7daystodie/mods/3816
apocalypse-now	cmjpvbuv70017egatqsu9rz34	f	\N
apocalypse-now	cmjifk4ik000204l4vbq70ch0	f	\N
asia-mod	cmjpvb0ns0006egatzxdn0or8	f	\N
asia-mod	cmjpvawfc0000egateou1h6c1	f	\N
asia-mod	cmjifk4ik000204l4vbq70ch0	f	\N
asia-mod	cmjpvb14f0007egat5dpugalt	f	\N
asia-mod	cmjpvb1cz0008egattixl1mie	f	\N
asia-mod	cmjpvb1li0009egatkefen8v3	f	\N
the-asylum	cmjpvb2fz000aegatft1ulq2w	f	\N
the-asylum	cmjphquha000bp8atwem7zz6s	f	\N
the-asylum	cmjifk4ik000204l4vbq70ch0	f	\N
back-to-origins	cmjpvb3de000begateqe9xzyy	f	\N
back-to-origins	cmjpvawfc0000egateou1h6c1	f	\N
back-to-origins	cmjifk4ik000204l4vbq70ch0	f	\N
back-to-origins	cmjifk4t6000404l4ry2obfui	f	\N
black-forrest	cmjpvb4kn000cegatddkniz98	f	\N
black-forrest	cmjpvawfc0000egateou1h6c1	f	\N
black-forrest	cmjifk4ik000204l4vbq70ch0	f	\N
cloud-mod	cmjpvb5iw000eegatohrt0to4	f	\N
cloud-mod	cmjifk4ik000204l4vbq70ch0	f	\N
darkness-falls	cmjpvb6h0000fegath1vbieb7	f	\N
darkness-falls	cmjpvawfc0000egateou1h6c1	f	\N
darkness-falls	cmjifk4ik000204l4vbq70ch0	f	\N
darkness-falls	cmjifk4t6000404l4ry2obfui	t	https://www.nexusmods.com/7daystodie/mods/7007
darkness-falls	cmjpvb14f0007egat5dpugalt	t	https://www.nexusmods.com/7daystodie/mods/2438
darkness-falls	cmjpvb1cz0008egattixl1mie	t	https://www.nexusmods.com/7daystodie/mods/2621
darkness-falls	cmjpvb7n9000gegat2z1q1anh	t	https://www.nexusmods.com/7daystodie/mods/6449
darkness-falls	cmjifk4nv000304l4k5rtq2zj	t	https://www.nexusmods.com/7daystodie/mods/4264
darkness-falls	cmjpvb84c000hegate6tbnffw	t	https://www.nexusmods.com/7daystodie/mods/4245
district-zero	cmjifk4ik000204l4vbq70ch0	f	\N
district-zero	cmjpvb9kl000jegatjgx0ux1f	t	https://www.nexusmods.com/7daystodie/mods/7041
district-zero	cmjifk4nv000304l4k5rtq2zj	t	https://www.nexusmods.com/7daystodie/mods/6041
endz	cmjpvbalu000legat6l7xjhn6	f	\N
endz	cmjpvbadr000kegatuli185tc	f	\N
endz	cmjifk4ik000204l4vbq70ch0	f	\N
escape-from-tarkov	cmjpvbbjq000megat07p9pz1r	f	\N
escape-from-tarkov	cmjpvbbsa000negatte4yw2ag	f	\N
escape-from-tarkov	cmjpvawfc0000egateou1h6c1	f	\N
escape-from-tarkov	cmjifk4ik000204l4vbq70ch0	f	\N
escape-from-tarkov	cmjifk4t6000404l4ry2obfui	t	https://www.nexusmods.com/7daystodie/mods/6197
escape-from-tarkov	cmjpvb1cz0008egattixl1mie	t	https://www.nexusmods.com/7daystodie/mods/6754
escape-from-tarkov	cmjpvb9kl000jegatjgx0ux1f	t	https://www.nexusmods.com/7daystodie/mods/7043
forsaken-trail	cmjpvbdm4000oegatrp28jqi2	f	\N
forsaken-trail	cmjpvawfc0000egateou1h6c1	f	\N
forsaken-trail	cmjifk4ik000204l4vbq70ch0	f	\N
gorenogodsk	cmjpvbelm000qegat06jfrjg5	f	\N
greys-prophesy	cmjpvbg27000segatsknqy4ji	f	\N
greys-prophesy	cmjpvawfc0000egateou1h6c1	f	\N
greys-prophesy	cmjifk4ik000204l4vbq70ch0	f	\N
i-am-legend	cmjphqs1v0008p8at8tv6qruu	f	\N
i-am-legend	cmjqdpaga0006r0at3pmv8940	f	\N
i-am-legend	cmjifk4ik000204l4vbq70ch0	f	\N
joke-mod	cmjphquy2000cp8at2rwsx4kl	f	\N
joke-mod	cmjphqv6l000dp8atpssdvmx7	f	\N
joke-mod	cmjphquha000bp8atwem7zz6s	f	\N
joke-mod	cmjifk4ik000204l4vbq70ch0	f	\N
never-alone	cmjpvbj58000uegat52iktnt2	f	\N
never-alone	cmjpvbelm000qegat06jfrjg5	f	\N
never-alone	cmjifk4ik000204l4vbq70ch0	f	\N
nord-army	cmjpvbk2o000vegatvbl7w8mj	f	\N
nord-army	cmjphquha000bp8atwem7zz6s	f	\N
nord-army	cmjifk4ik000204l4vbq70ch0	f	\N
nord-army	cmjpvb14f0007egat5dpugalt	f	\N
preppocalypse	cmjpvbm7z000yegat7reeg0vy	f	\N
preppocalypse	cmjpvawfc0000egateou1h6c1	f	\N
preppocalypse	cmjifk4ik000204l4vbq70ch0	f	\N
ravenhearst	cmjpvbn5b000zegatzmw5qerw	f	\N
ravenhearst	cmjpvawfc0000egateou1h6c1	f	\N
ravenhearst	cmjifk4ik000204l4vbq70ch0	f	\N
ravenhearst	cmjifk4t6000404l4ry2obfui	t	https://www.nexusmods.com/7daystodie/mods/2741
ravenhearst	cmjpvb7n9000gegat2z1q1anh	t	https://7daystodiemods.com/translation-portuguese-brazil-mod-ravenhearst/
ravenhearst	cmjpvb84c000hegate6tbnffw	t	https://www.nexusmods.com/7daystodie/mods/3470
ravenhearst	cmjpvb9kl000jegatjgx0ux1f	t	https://www.nexusmods.com/7daystodie/mods/4676
rebirth	cmjpvbp800010egatulfkzmy6	f	\N
rebirth	cmjphquha000bp8atwem7zz6s	f	\N
rebirth	cmjifk4ik000204l4vbq70ch0	f	\N
rebirth	cmjifk4t6000404l4ry2obfui	f	\N
rebirth	cmjpvb14f0007egat5dpugalt	f	\N
scavengers-of-the-living-dead	cmjpvbn5b000zegatzmw5qerw	f	\N
rebirth	cmjpvbqe90011egat3rjld0kc	f	\N
rebirth	cmjpvbqmq0012egatwhzt9pmm	f	\N
rebirth	cmjpvb1cz0008egattixl1mie	f	\N
rebirth	cmjpvbr3r0013egatxc2ljw2x	f	\N
rebirth	cmjpvbrcb0014egat3g3nlwaz	f	\N
rebirth	cmjpvb7n9000gegat2z1q1anh	f	\N
rebirth	cmjpvbrte0015egat8conaj81	f	\N
rebirth	cmjpvb9kl000jegatjgx0ux1f	f	\N
rebirth	cmjifk4nv000304l4k5rtq2zj	f	\N
scavengers-of-the-living-dead	cmjifk4ik000204l4vbq70ch0	f	\N
silent-hill	cmjpvb8uu000iegatamo9e1ox	f	\N
age-of-oblivion	cmjifk4ik000204l4vbq70ch0	f	\N
age-of-oblivion	cmjphqq4w0002p8atc2t61orh	f	\N
age-of-oblivion	cmjpvazoq0005egatnu9vqe59	f	\N
age-of-oblivion	cmjpvbelm000qegat06jfrjg5	f	\N
age-of-oblivion	cmjrl5qwy0000q0atmivch07s	f	\N
\.


--
-- Data for Name: News; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."News" (id, "modSlug", "modName", "modVersion", "gameVersion", "actionText", content, description, date, "wipeRequired", "sourceUrl", tags, "createdAt", "updatedAt", "newscatTagId", "gameVersionTagId") FROM stdin;
cmjralwmg000004l4da1c2iye	district-zero	District Zero	v1.2	V1.2	update	- <p>Все живы</p><p>Все живы<br>Точно<br>Не вру</p>	v1.2 вышла.	2025-12-24 21:00:00	t	ya.ru	[{"color": "#22c55e", "category": "newscat", "displayName": "Update"}]	2025-12-29 15:07:59.464	2025-12-29 15:07:59.464	\N	\N
cmjrao4uc000304l5pni5461o	28-alphas-later	28 Alphas Later		V1.4	update		 вышла.	2025-12-27 21:00:00	f	ya.ru	[{"color": "#22c55e", "category": "newscat", "displayName": "Update"}]	2025-12-29 15:09:43.428	2025-12-29 15:09:43.428	\N	\N
cmjrpnsl20000b8atk9m8dob5	28-alphas-later	28 Alphas Later	1.0.0.0	\N	update		1.0.0.0 released.	2025-12-29 22:09:08.379	f	ya.ru	[{"id": "cmjj2cyk3000004l44r6vvqc0", "color": "#22c55e", "category": "newscat", "displayName": "Update"}]	2025-12-29 22:09:21.782	2025-12-29 22:09:21.782	cmjj2cyk3000004l44r6vvqc0	\N
\.


--
-- Data for Name: ProfileView; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProfileView" (id, "viewerId", "viewedId", "viewedAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
cmjonrwkr0006sgattwao9idj	572a982f-f9fc-4238-8cea-9b9d59dfcdf1	cmjnh24rd0000y4atmdivnv92	2026-01-29 10:36:43.691
cmjqz4prb000004l119p92weq	ff5bd941-0251-4615-9dac-3b9d31e21623	cmjnh24rd0000y4atmdivnv92	2026-02-06 19:52:41.07
cmjnh24ug0002y4atddp1x76q	f67deed7-9406-44d1-b827-e4d627fe6009	cmjnh24rd0000y4atmdivnv92	2026-02-09 14:57:25.354
cmjnhe2kd000004lbxkxbpn59	3e0ad0a8-b293-4860-b8ac-08af72bf7706	cmjnh24rd0000y4atmdivnv92	2026-02-10 07:33:22.906
cmjonuc8g0007sgat65e1i4cn	fafabc50-850f-441b-bf31-c542ce8d1b9b	cmjnh24rd0000y4atmdivnv92	2026-02-10 11:34:53.255
cmjr9xhuy000204l2t52ns0vx	2812ed6b-5f0f-4631-981a-99da7e9ecccd	cmjr9xhp7000004l2pqi0rilw	2026-02-16 18:07:29.571
cmltj1hmu000004jvhf33osok	bd608e51-c69e-41c5-a86f-8d7ddcf44ee9	cmjnh24rd0000y4atmdivnv92	2026-03-21 13:59:00.479
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subscription" (id, "userId", "modSlug", "subscribedAt", "lastViewedAt", "unseenVersions") FROM stdin;
cmjraitv0000304kzq9iv1jzm	cmjr9xhp7000004l2pqi0rilw	rebirth	2025-12-29 15:05:35.916	2025-12-29 15:05:35.916	0
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Tag" (id, category, value, "displayName", color) FROM stdin;
cmjouh9eh000msgatz71rjv77	tag	scrap-tools	Scrap tools	#a1a1a1
cmjpvb8uu000iegatamo9e1ox	gamever	1_2	V1.2	#ab6f4d
cmjpvbvtf0019egatzkvsekcz	author	fluffernuttersandwitch	FlufferNutterSandwitch	\N
cmjpvbwrs001aegath1ztysvk	author	tekjagameplays	TEKJAGAMEPLAYS	\N
cmjifk47z000004l48rbn65iz	author	redbeard	Redbeard	#22d3ee
cmjifk4d9000104l48eacx387	author	kugi	Kugi	#22d3ee
cmjphqq4w0002p8atc2t61orh	author	pipermac	Pipermac	\N
cmjifk4ys000504l4xpgfa07d	tag	items	Items	#a1a1a1
cmjifk543000604l4xopjepiz	tag	hardcore	Hardcore	#a1a1a1
cmjifk59g000704l4jl98e1u2	tag	ui	UI	#a1a1a1
cmjifk5eq000804l4v9k7k2gj	tag	no-trader	No trader	#a1a1a1
cmjifk5jz000904l48lqmgn6e	tag	ores	Ores	#a1a1a1
cmjphqqm10004p8atmb7e03j9	tag	overhaul	Overhaul	\N
cmjifk657000d04l44a86q6la	tag	classes	Classes	#a1a1a1
cmjifk6ah000e04l4sfgbju8q	tag	quality-system	Quality system	#a1a1a1
cmjphqqul0005p8atre6qe8f7	tag	farming	Farming	\N
cmjphqr380006p8aty2j7vam6	tag	magic	Magic	\N
cmjifmy6z000204lggtxvplot	tag	horror	Horror	#a1a1a1
cmjphqs1v0008p8at8tv6qruu	author	hells_janitor	Hells Janitor	\N
cmjphqsi70009p8atiqjgwb5s	tag	difficulty	Difficulty	\N
cmjphqti7000ap8at1g8jjlbr	author	war3zuk	War3zuk	\N
cmjphquy2000cp8at2rwsx4kl	author	rizzomf	RizzoMF	\N
cmjphqv6l000dp8atpssdvmx7	author	zilox	Zilox	\N
cmjphqve9000ep8at2wgzate7	tag	fun	Fun	\N
cmjphv5ff0000w8at5qnaytf1	author	bdubyah	bdubyah	\N
cmjpvbl1o000wegatbiu9088j	gamever	na	N/A	#71717a
cmjpvawfc0000egateou1h6c1	gamever	1_4	V1.4	#7d8c52
cmjpvbzob001degatce2666or	gamever	a20	A20	#ef4444
cmjpvbadr000kegatuli185tc	gamever	2_0	V2.0	#669a55
cmjpvaxle0002egatdpbubo4k	author	sarahandjeff	SarahAndJeff	\N
cmjpvayiu0004egatdkxpfre8	author	dullahan_reaper	Dullahan_Reaper	\N
cmjpvazoq0005egatnu9vqe59	author	nams	Nams	\N
cmjpvb0ns0006egatzxdn0or8	author	hessenbub	HessenBub	\N
cmjpvb14f0007egat5dpugalt	lang	german	German	\N
cmjpvb1cz0008egattixl1mie	lang	japanese	Japanese	\N
cmjpvb1li0009egatkefen8v3	lang	brazilian	Brazilian	\N
cmjpvb2fz000aegatft1ulq2w	author	badbunny87	badbunny87	\N
cmjpvb3de000begateqe9xzyy	author	radee	RaDee	\N
cmjpvb4kn000cegatddkniz98	author	black_forrest_team	Black Forrest Team	\N
cmjpvb5iw000eegatohrt0to4	author	nocloud4u	nocloud4u	\N
cmjpvb6h0000fegath1vbieb7	author	khaine	Khaine	\N
cmjpvb7n9000gegat2z1q1anh	lang	portugese	Portugese	\N
cmjpvb84c000hegate6tbnffw	lang	ukrainian	Ukrainian	\N
cmjpvb9kl000jegatjgx0ux1f	lang	chinese	Chinese	\N
cmjpvbalu000legat6l7xjhn6	author	theelegion	TheeLegion	\N
cmjpvbbjq000megat07p9pz1r	author	bryandvs	BryanDVS	\N
cmjpvbbsa000negatte4yw2ag	author	m14	M14	\N
cmjpvbdm4000oegatrp28jqi2	author	haidrgna	HaidrGna	\N
cmjj2cyk3000004l44r6vvqc0	newscat	update	Update	#22c55e
cmjifk4ik000204l4vbq70ch0	lang	english	English	\N
cmjifk4nv000304l4k5rtq2zj	lang	spanish	Spanish	\N
cmjifk4t6000404l4ry2obfui	lang	russian	Russian	\N
cmjpvbeu7000regat31b56zyv	author	grumbleman	Grumbleman	\N
cmjifk5zy000c04l468pblpn8	tag	liquid-system	Liquid system	#a1a1a1
cmjifk5pc000a04l48gsu8uxx	tag	wellness_system	Wellness system	#a1a1a1
cmjifk5un000b04l4ysc7pb9o	tag	weight-system	Weight system	#a1a1a1
cmjoue3vf000ksgatkniewo88	tag	crafting	Crafting	#a1a1a1
cmjoue3yt000lsgatk2tq53vv	tag	decor	Decor	#a1a1a1
cmjpvbg27000segatsknqy4ji	author	ganthegrey	GanTheGrey	\N
cmjpvbj58000uegat52iktnt2	author	icerogue	IceRogue	\N
cmjpvbk2o000vegatvbl7w8mj	author	nordmann	NORDMANN	\N
cmjpvbla8000xegatsroe3vba	author	unknown	Unknown	\N
cmjpvbm7z000yegat7reeg0vy	author	arramus	arramus	\N
cmjpvbn5b000zegatzmw5qerw	author	jaxteller718	JaxTeller718	\N
cmjpvbp800010egatulfkzmy6	author	furiousramsay	FuriousRamsay	\N
cmjpvbqe90011egat3rjld0kc	lang	french	French	\N
cmjpvbqmq0012egatwhzt9pmm	lang	italian	Italian	\N
cmjpvbr3r0013egatxc2ljw2x	lang	korean	Korean	\N
cmjpvbrcb0014egat3g3nlwaz	lang	polish	Polish	\N
cmjpvbrte0015egat8conaj81	lang	turkish	Turkish	\N
cmjpvbuv70017egatqsu9rz34	author	killerbunny264	Killerbunny264	\N
cmjpvby0n001begatdudh935v	author	spiderjzmod	SpiderJZMOD	\N
cmjpvbyyr001cegatlfoebjti	author	doubleblundy	DoubleBlundy	\N
cmjpvbzwx001eegatgwak2wti	author	subquake	Subquake	\N
cmjpvc2tx001fegatun0yoxqy	author	dirkillergaming	DirkillerGaming	\N
cmjpvc986001gegatkdwuxhxr	author	tallman_brad	Tallman Brad	\N
cmjpvcapm001iegat04olz3xs	author	sphereii	SphereII	\N
cmjpvcbnp001jegat5bv1gdlj	author	dj_triple_xmr	DJ Triple XMR	\N
cmjpvk8wm0001gkats3xh94i2	author	sorcery_team	Sorcery Team	\N
cmjpvkhya0002gkatsds6um0l	author	dwallorde	Dwallorde	\N
cmjpvaxcu0001egatdby6l664	gamever	2_1	V2.1	#50a858
cmjpvbvku0018egatw9edh8br	gamever	2_3	V2.3	#39b75b
cmjphquha000bp8atwem7zz6s	gamever	2_4	V2.4	#22c55e
cmjpvbelm000qegat06jfrjg5	gamever	a21	A21	#d85247
cmjqxxhaw000avgat7qi7z0c7	tag	vehicles	Vehicles	#a1a1a1
cmjqxxhdg000bvgatp7dvipk8	tag	world-generation	World generation	#a1a1a1
cmjqxxhgg000cvgatg3v9accn	tag	weapons	Weapons	#a1a1a1
cmjrl5qwy0000q0atmivch07s	status	active	Active	\N
d4d328eb-9989-4d17-a507-2a05bccbe7e5	status	on_hold	On Hold	\N
bf85f445-a69e-47b7-a310-2ca99f7a0bde	status	discontinued	Discontinued	\N
e5ab614f-1545-44a3-8eef-af58d5ce6e65	status	upcoming	Upcoming	\N
24ca9883-029c-4034-adab-74872a3a52de	status	unknown	Unknown	\N
manual-newscat-new	newscat	new	New	#a855f7
manual-newscat-status	newscat	status	Status	#d4d4d8
manual-newscat-release	newscat	release	Release	#22d3ee
cmjslbmix0002msatot4jbyzl	tag	animals	Animals	#a1a1a1
cmjqdpaga0006r0at3pmv8940	gamever	1	V1	#c1614a
cmjrpnsud0001b8at3ke4cpua	gamever	1_3	V1.3	#947d50
cmjsndnu000006watd1atvjpf	gamever	1_1_b14	V1.1 b14	#22c55e
cmjsndohu00016watnmsrnrk5	gamever	a21_2	A21.2	#22c55e
cmjsndp6600026watpt608vrv	gamever	a20_7	A20.7	#22c55e
cmjsndsgs00036wat2n07d4av	gamever	24	V24	#22c55e
cmjsne4qs00056watkxa9nezz	gamever	a20_5b2	A20.5B2	#22c55e
\.


--
-- Data for Name: TranslationSuggestion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TranslationSuggestion" (id, "modSlug", "modName", "languageCode", "languageName", author, link, status, "submittedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, "emailVerified", image, bio, role, "isBanned", "createdAt", "updatedAt", "isProfilePublic", "profileViews") FROM stdin;
cmjnh24rd0000y4atmdivnv92	ᚱanazy	ssalvadorr_official@mail.ru	\N	https://cdn.discordapp.com/avatars/481536362303193091/b1e41b48a76e53a77889dfceb50974f9.png	\N	ADMIN	f	2025-12-26 22:57:29.497	2025-12-26 23:02:57.494	t	0
cmjr9xhp7000004l2pqi0rilw	Droid1652	fireninjacreeper@mail.ru	\N	https://cdn.discordapp.com/avatars/936725812638515200/209e4f52c264cba4d52efdd666b0ddf8.png	\N	ADMIN	f	2025-12-29 14:49:00.379	2025-12-29 14:51:22.699	t	0
\.


--
-- Data for Name: UserBadge; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserBadge" (id, "userId", "badgeId", "earnedAt") FROM stdin;
\.


--
-- Data for Name: UserSocialLink; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserSocialLink" (id, "userId", platform, url) FROM stdin;
\.


--
-- Data for Name: ViewHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ViewHistory" (id, "userId", "modSlug", "viewedAt") FROM stdin;
cmjoc2p2q0000bkatvx6m8u25	cmjnh24rd0000y4atmdivnv92	echoes-from-the-afterlife	2026-02-19 14:04:03.508
cmjpvvke10009t0at4317os8m	cmjnh24rd0000y4atmdivnv92	gorenogodsk	2025-12-29 14:00:38.816
cmjra3q8w000004kz2riwpkw7	cmjr9xhp7000004l2pqi0rilw	age-of-oblivion	2025-12-29 14:53:51.392
cmjr9xk4z000004k1xbg0ukqo	cmjr9xhp7000004l2pqi0rilw	echoes-from-the-afterlife	2025-12-29 14:54:57.649
cmjrage67000104l5pm9stlka	cmjr9xhp7000004l2pqi0rilw	gorenogodsk	2025-12-29 15:03:42.271
cmjrah86j000204l5jk8xwsan	cmjr9xhp7000004l2pqi0rilw	rebirth	2025-12-29 15:05:26.765
cmjpvf68t000004i52fd0qefx	cmjnh24rd0000y4atmdivnv92	your-end	2025-12-28 15:15:04.925
cmjpw7dth000ft0atcf3f0f1k	cmjnh24rd0000y4atmdivnv92	outback-roadies	2025-12-30 12:56:22.622
cmjpvcymd0000t0atkunovmaw	cmjnh24rd0000y4atmdivnv92	the-wasteland	2025-12-28 15:35:19.407
cmjqd3n4h0002r0at7qkz0nzd	cmjnh24rd0000y4atmdivnv92	i-am-legend	2025-12-28 23:46:01.996
cmjpvfgeh000104i5eklxj1m0	cmjnh24rd0000y4atmdivnv92	vikings-mod-to-be-released	2026-01-30 09:21:26.189
cmjrptpzf0002b8atbugiy41u	cmjnh24rd0000y4atmdivnv92	28-alphas-later	2026-01-30 09:21:31.985
cmjrqhidf0004b8atdecnzggc	cmjnh24rd0000y4atmdivnv92	district-zero	2026-01-30 09:21:38.508
cml0obz55000404le4ya7m7ik	cmjnh24rd0000y4atmdivnv92	advanced-survival-overhaul	2026-01-30 09:21:48.713
cml0oc80k000004jluaubpyhj	cmjnh24rd0000y4atmdivnv92	scavengers-of-the-living-dead	2026-01-30 09:22:00.212
cmjpwmyzg000104jud5vsujdc	cmjnh24rd0000y4atmdivnv92	age-of-oblivion	2026-02-19 13:56:41.346
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (comment) FROM stdin;
\.


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Account Account_provider_providerAccountId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE (provider, "providerAccountId");


--
-- Name: AnonymousDownload AnonymousDownload_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnonymousDownload"
    ADD CONSTRAINT "AnonymousDownload_pkey" PRIMARY KEY (id);


--
-- Name: AnonymousView AnonymousView_modSlug_sessionId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnonymousView"
    ADD CONSTRAINT "AnonymousView_modSlug_sessionId_key" UNIQUE ("modSlug", "sessionId");


--
-- Name: AnonymousView AnonymousView_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnonymousView"
    ADD CONSTRAINT "AnonymousView_pkey" PRIMARY KEY (id);


--
-- Name: Badge Badge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_pkey" PRIMARY KEY (id);


--
-- Name: DownloadHistory DownloadHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DownloadHistory"
    ADD CONSTRAINT "DownloadHistory_pkey" PRIMARY KEY (id);


--
-- Name: DownloadHistory DownloadHistory_userId_modSlug_sessionId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DownloadHistory"
    ADD CONSTRAINT "DownloadHistory_userId_modSlug_sessionId_key" UNIQUE ("userId", "modSlug", "sessionId");


--
-- Name: ModSubmission ModSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ModSubmission"
    ADD CONSTRAINT "ModSubmission_pkey" PRIMARY KEY (id);


--
-- Name: ModSubmission ModSubmission_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ModSubmission"
    ADD CONSTRAINT "ModSubmission_slug_key" UNIQUE (slug);


--
-- Name: ModTag ModTag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ModTag"
    ADD CONSTRAINT "ModTag_pkey" PRIMARY KEY ("modId", "tagId");


--
-- Name: Mod Mod_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mod"
    ADD CONSTRAINT "Mod_pkey" PRIMARY KEY (slug);


--
-- Name: News News_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."News"
    ADD CONSTRAINT "News_pkey" PRIMARY KEY (id);


--
-- Name: ProfileView ProfileView_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfileView"
    ADD CONSTRAINT "ProfileView_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_sessionToken_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_sessionToken_key" UNIQUE ("sessionToken");


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_userId_modSlug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_userId_modSlug_key" UNIQUE ("userId", "modSlug");


--
-- Name: Tag Tag_category_value_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_category_value_key" UNIQUE (category, value);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: TranslationSuggestion TranslationSuggestion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TranslationSuggestion"
    ADD CONSTRAINT "TranslationSuggestion_pkey" PRIMARY KEY (id);


--
-- Name: UserBadge UserBadge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_pkey" PRIMARY KEY (id);


--
-- Name: UserSocialLink UserSocialLink_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSocialLink"
    ADD CONSTRAINT "UserSocialLink_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: ViewHistory ViewHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ViewHistory"
    ADD CONSTRAINT "ViewHistory_pkey" PRIMARY KEY (id);


--
-- Name: ViewHistory ViewHistory_userId_modSlug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ViewHistory"
    ADD CONSTRAINT "ViewHistory_userId_modSlug_key" UNIQUE ("userId", "modSlug");


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: AnonymousDownload_downloadedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AnonymousDownload_downloadedAt_idx" ON public."AnonymousDownload" USING btree ("downloadedAt");


--
-- Name: AnonymousDownload_modSlug_ipAddress_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AnonymousDownload_modSlug_ipAddress_key" ON public."AnonymousDownload" USING btree ("modSlug", "ipAddress");


--
-- Name: AnonymousView_viewedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AnonymousView_viewedAt_idx" ON public."AnonymousView" USING btree ("viewedAt");


--
-- Name: Badge_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Badge_slug_key" ON public."Badge" USING btree (slug);


--
-- Name: ProfileView_viewedId_viewedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProfileView_viewedId_viewedAt_idx" ON public."ProfileView" USING btree ("viewedId", "viewedAt");


--
-- Name: UserBadge_userId_badgeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON public."UserBadge" USING btree ("userId", "badgeId");


--
-- Name: UserSocialLink_userId_platform_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserSocialLink_userId_platform_key" ON public."UserSocialLink" USING btree ("userId", platform);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: AnonymousDownload AnonymousDownload_modSlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnonymousDownload"
    ADD CONSTRAINT "AnonymousDownload_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES public."Mod"(slug) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AnonymousView AnonymousView_modSlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnonymousView"
    ADD CONSTRAINT "AnonymousView_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES public."Mod"(slug) ON DELETE CASCADE;


--
-- Name: DownloadHistory DownloadHistory_modSlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DownloadHistory"
    ADD CONSTRAINT "DownloadHistory_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES public."Mod"(slug) ON DELETE CASCADE;


--
-- Name: DownloadHistory DownloadHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DownloadHistory"
    ADD CONSTRAINT "DownloadHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: ModSubmission ModSubmission_submitterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ModSubmission"
    ADD CONSTRAINT "ModSubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES public."User"(id);


--
-- Name: ModTag ModTag_modId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ModTag"
    ADD CONSTRAINT "ModTag_modId_fkey" FOREIGN KEY ("modId") REFERENCES public."Mod"(slug) ON DELETE CASCADE;


--
-- Name: ModTag ModTag_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ModTag"
    ADD CONSTRAINT "ModTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON DELETE CASCADE;


--
-- Name: Mod Mod_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mod"
    ADD CONSTRAINT "Mod_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id);


--
-- Name: News News_modSlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."News"
    ADD CONSTRAINT "News_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES public."Mod"(slug);


--
-- Name: ProfileView ProfileView_viewedId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfileView"
    ADD CONSTRAINT "ProfileView_viewedId_fkey" FOREIGN KEY ("viewedId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Subscription Subscription_modSlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES public."Mod"(slug) ON DELETE CASCADE;


--
-- Name: Subscription Subscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: TranslationSuggestion TranslationSuggestion_modSlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TranslationSuggestion"
    ADD CONSTRAINT "TranslationSuggestion_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES public."Mod"(slug) ON DELETE CASCADE;


--
-- Name: UserBadge UserBadge_badgeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES public."Badge"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserBadge UserBadge_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSocialLink UserSocialLink_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSocialLink"
    ADD CONSTRAINT "UserSocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ViewHistory ViewHistory_modSlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ViewHistory"
    ADD CONSTRAINT "ViewHistory_modSlug_fkey" FOREIGN KEY ("modSlug") REFERENCES public."Mod"(slug) ON DELETE CASCADE;


--
-- Name: ViewHistory ViewHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ViewHistory"
    ADD CONSTRAINT "ViewHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict RdnJuRkBvCgtJMPvKeKLeDvZmpfZ6dH3r6TtoyX8nOMv4g01oUkgCtkW2LuMQcF

