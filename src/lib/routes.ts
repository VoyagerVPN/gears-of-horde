/**
 * Centralized route constants for revalidatePath and navigation.
 */
export const ROUTES = {
    profile: '/profile',
    admin: '/admin',
    mods: '/admin/mods',
    publicMods: '/mods', // Public mods browse page
    tags: '/admin/tags',
    users: '/admin/users',
    settings: '/admin/settings',
    news: '/admin/news',
    myMods: '/profile/my-mods',
    editor: '/editor',
} as const;

