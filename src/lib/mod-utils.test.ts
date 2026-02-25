import { describe, it, expect } from 'vitest';
import { convertSubmissionToModData } from './mod-utils';
import { ModSubmission } from '@/types/mod';

describe('Mod Utilities', () => {
    describe('convertSubmissionToModData', () => {
        it('should correctly map all fields from submission', () => {
            const submission: ModSubmission = {
                id: 'sub-1',
                submitterId: 'user-1',
                submitterName: 'Test Submitter',
                submittedAt: new Date().toISOString(),
                status: 'pending',
                title: 'Test Mod',
                slug: 'test-mod',
                version: '1.0.0',
                author: 'Khaine',
                description: 'A test mod description with more than five words.',
                gameVersion: 'A21',
                bannerUrl: 'https://example.com/banner.png',
                isSaveBreaking: true,
                features: ['Feature 1', 'Feature 2'],
                tags: [{ id: '1', category: 'tag', value: 'survival', displayName: 'Survival' }],
                installationSteps: ['Step 1'],
                links: { 
                    download: 'https://dl.com',
                    discord: '',
                    community: [],
                    donations: []
                },
                videos: { trailer: '', review: '' },
                screenshots: ['https://ex.com/s1.png'],
                changelog: [],
                localizations: []
            };

            const modData = convertSubmissionToModData(submission);

            expect(modData.title).toBe(submission.title);
            expect(modData.slug).toBe(submission.slug);
            expect(modData.version).toBe(submission.version);
            expect(modData.status).toBe('active');
            expect(modData.stats.downloads).toBe("0");
            expect(modData.isSaveBreaking).toBe(true);
        });

        it('should handle missing bannerUrl by providing empty string', () => {
             const submission: any = {
                title: 'Test',
                slug: 'test',
                links: {},
                stats: {}
            };
            const modData = convertSubmissionToModData(submission as any);
            expect(modData.bannerUrl).toBe('');
        });
    });
});
