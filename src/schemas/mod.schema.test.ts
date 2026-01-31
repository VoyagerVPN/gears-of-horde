import { describe, it, expect } from 'vitest';
import { ModDataSchema } from './mod.schema';

describe('Mod Schema (Zod)', () => {
    const validMod = {
        title: 'Valid Mod Title',
        slug: 'valid-slug-123',
        version: '1.0.0',
        author: 'Author Name',
        description: 'This is a valid description with enough words.',
        status: 'active',
        gameVersion: 'A21',
        bannerUrl: 'https://example.com/banner.jpg',
        isSaveBreaking: false,
        features: ['Feature 1'],
        tags: [
            { id: '1', category: 'tag', value: 'test', displayName: 'Test' }
        ],
        installationSteps: ['Step 1'],
        links: { 
            download: 'https://example.com/dl',
            discord: '',
            community: [],
            donations: []
        },
        stats: { rating: 0, ratingCount: 0, downloads: "0", views: "0" },
        videos: { trailer: '', review: '' },
        screenshots: ['https://example.com/ss1.jpg'],
        changelog: [],
        localizations: []
    };

    it('should validate a correct mod object', () => {
        const result = ModDataSchema.safeParse(validMod);
        if (!result.success) {
            console.error(JSON.stringify(result.error.format(), null, 2));
        }
        expect(result.success).toBe(true);
    });

    it('should fail on invalid slug (spaces)', () => {
        const result = ModDataSchema.safeParse({ ...validMod, slug: 'invalid slug' });
        expect(result.success).toBe(false);
    });

    it('should fail on invalid slug (special characters)', () => {
        const result = ModDataSchema.safeParse({ ...validMod, slug: 'slug!!!' });
        expect(result.success).toBe(false);
    });

    it('should fail if description is too short', () => {
        const result = ModDataSchema.safeParse({ ...validMod, description: 'Too short' });
        expect(result.success).toBe(false);
    });

    it('should fail if bannerUrl is not a valid URL', () => {
        const result = ModDataSchema.safeParse({ ...validMod, bannerUrl: 'not-a-url' });
        expect(result.success).toBe(false);
    });

    it('should fail if screenshots are empty', () => {
        const result = ModDataSchema.safeParse({ ...validMod, screenshots: [] });
        expect(result.success).toBe(false);
    });

    it('should validate various game version formats', () => {
        const validVersions = ['V1.0', 'A20', 'A21', 'V1.1b14', 'N/A', 'A20.5', 'A20.5b2'];
        validVersions.forEach(v => {
            const result = ModDataSchema.safeParse({ ...validMod, gameVersion: v });
            expect(result.success).toBe(true);
        });
    });
});
