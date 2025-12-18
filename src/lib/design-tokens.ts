/**
 * Design Tokens
 * Centralized design system values for spacing, typography, borders, and animations
 */

export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
} as const;

export const fontSize = {
    xs: '10px',
    sm: '11px',
    base: '12px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
} as const;

export const borderRadius = {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
} as const;

export const transition = {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
} as const;

export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof fontSize;
export type BorderRadius = keyof typeof borderRadius;
export type Transition = keyof typeof transition;
