# Gears of Horde Architecture

This document outlines the architecture of the Gears of Horde application, a Next.js project for cataloging overhaul mods for the game "7 Days to Die".

## Project Structure

The project is structured as a standard Next.js application with the `src` directory.

### `src/app` - Routing and Pages

The `src/app` directory contains the main application routes and pages, following the Next.js App Router paradigm. The routing is internationalized, with all pages residing under a `[locale]` dynamic route.

#### `src/app/[locale]/layout.tsx`

This is the root layout for the entire application. It sets up the main HTML structure, including the `<html>` and `<body>` tags, and wraps the content with the necessary providers.

*   **Providers**: `NextIntlClientProvider` for internationalization and `Providers` for other context providers.
*   **Components**: It uses the `Navbar` component for the main navigation and a `SkipLink` component for accessibility.
*   **Styling**: It applies the `Exo_2` font and basic background and text colors.
*   **Metadata**: It sets up the default metadata for the application, including title, description, and openGraph tags.
*   **Analytics**: It includes Vercel Analytics and Speed Insights.

#### `src/app/[locale]/page.tsx`

This is the main landing page of the application, corresponding to the `/` route. It displays a hero section, a list of mods, and a news sidebar.

*   **Components**: It uses the `HeroSection` for the top banner, `ModSection` to display different categories of mods, and `NewsCard` to display the latest news.
*   **Data Fetching**: It fetches the latest news and mods by different categories (`updated`, `featured`, `top_rated`) in parallel using server actions.

#### Pages

*   **/admin**: Contains the admin dashboard and related functionalities.
*   **/author**: Pages related to mod authors.
*   **/editor**: Pages for the mod editor.
*   **/faq**: The Frequently Asked Questions page.
*   **/mods**: The main page for browsing and viewing mods.
*   **/news**: The news section of the website.
*   **/profile**: User profile pages.
*   **/search**: The search page.

### `src/components` - Reusable Components

This directory contains all the reusable React components used throughout the application.

#### General Components

*   `AuthButton.tsx`: A button for user authentication (login/logout).
*   `AuthorTag.tsx`: A component to display an author's tag.
*   `DateDisplay.tsx`: A component to format and display dates.
*   `HeroSection.tsx`: The main hero section for the home page.
*   `ImageViewer.tsx`: A component to display images in a lightbox.
*   `LanguageSwitcher.tsx`: A component to switch the application's locale.
*   `ModCard.tsx`: A card component to display mod information.
*   `ModSection.tsx`: A section to display a list of mods.
*   `Navbar.tsx`: The main navigation bar.
*   `NewsCard.tsx`: A card component to display news items.
*   `Providers.tsx`: A component to wrap the application with necessary context providers.
*   `SkipLink.tsx`: A link for accessibility to skip to the main content.
*   `SortToolbar.tsx`: A toolbar for sorting and filtering.
*   `TagSelector.tsx`: A component for selecting tags.
*   `VersionTag.tsx`: A component to display a version tag.

#### Component Categories

*   `admin`: Components related to the admin dashboard.
*   `layouts`: Layout components for different page structures.
*   `mod`: Components related to the mod pages, such as the editor, feedback section, and media gallery.
*   `news`: Components related to the news section.
*   `profile`: Components for the user profile page.
*   `tags`: Components for managing and displaying tags.
*   `ui`: General-purpose UI components like buttons, dialogs, etc.

### `src/lib` - Utility Functions

This directory contains utility functions, helper scripts, and library configurations.

*   `config.ts`: Application configuration settings.
*   `cropImage.ts`: Utility functions for cropping images.
*   `dateUtils.ts`: Utility functions for date manipulation and formatting.
*   `db.ts`: Database connection and Prisma client instance.
*   `design-tokens.ts`: Definitions for design tokens like colors, spacing, etc.
*   `imageCompression.ts`: Utility functions for compressing images.
*   `mod-constants.ts`: Constants related to mods.
*   `mod-utils.ts`: Utility functions for mods.
*   `result.ts`: A utility for handling function results with success or error states.
*   `routes.ts`: Definitions of application routes.
*   `tag-colors.ts`: Color definitions for tags.
*   `tag-utils.ts`: Utility functions for tags.
*   `tags.ts`: Tag-related functionalities.
*   `utils.ts`: General utility functions.
*   `constants`: A directory for constants.

### `src/schemas` - Data Schemas

This directory contains Zod schemas for data validation throughout the application.

*   `index.ts`: Exports all the schemas.
*   `mod.schema.ts`: Schema for mod data.
*   `news.schema.ts`: Schema for news data.
*   `profile.schema.ts`: Schema for user profile data.
*   `submission.schema.ts`: Schema for mod submission data.
*   `tag.schema.ts`: Schema for tag data.

### Scripts

This directory contains various scripts for data migration, seeding, and maintenance.

#### Root `scripts` directory

*   `check-tags.ts`: Checks for tag-related issues.
*   `extract_mods.js`: Extracts mod data from an external source.
*   `fix_gamever_tags.ts`: Fixes game version tags.
*   `fix_link_names.ts`: Fixes link names.
*   `fix_na_color.ts`: Fixes the 'N/A' color.
*   `make-admin.ts`: Gives a user admin privileges.
*   `seed_notion_mods.ts`: Seeds the database with mods from Notion.
*   `seed-languages.ts`: Seeds the database with languages.
*   `seed-news-tags.ts`: Seeds the database with news tags.
*   `seed-tags.ts`: Seeds the database with tags.
*   `sync-authors.ts`: Synchronizes authors.
*   `sync-tags.ts`: Synchronizes tags.
*   `unfurl_links.ts`: Unfurls links.
*   `update_author_tag_colors.ts`: Updates author tag colors.
*   `verify-mod-creation.ts`: Verifies mod creation.

#### `src/scripts` directory

*   `check-overlap.ts`: Checks for overlapping data.
*   `check-tags.ts`: Checks for tag-related issues.
*   `debug-mod-tags.ts`: Debugs mod tags.
*   `repro-issue.ts`: Reproduces an issue.
*   `restore-ghost-tags.ts`: Restores ghost tags.
*   `sync-extracted-tags.ts`: Synchronizes extracted tags.
*   `test-env.ts`: Tests the environment.
