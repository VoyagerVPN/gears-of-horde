import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findOrCreateGameVerTag, findOrCreateAuthorTag } from './tag-utils';
import { db } from './db';

// Mock the Prisma client
vi.mock('./db', () => ({
    db: {
        tag: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

describe('Tag Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('findOrCreateGameVerTag', () => {
        it('should normalize standard V versions correctly (V1.0 -> 1_0)', async () => {
            vi.mocked(db.tag.findUnique).mockResolvedValue(null);
            vi.mocked(db.tag.create).mockImplementation(({ data }: any) => Promise.resolve({ id: '1', ...data }));

            const result = await findOrCreateGameVerTag('V1.0');
            
            expect(result.value).toBe('1_0');
            expect(result.displayName).toBe('V1.0');
        });

        it('should handle alpha versions (A21 -> a21)', async () => {
            vi.mocked(db.tag.findUnique).mockResolvedValue(null);
            vi.mocked(db.tag.create).mockImplementation(({ data }: any) => Promise.resolve({ id: '2', ...data }));

            const result = await findOrCreateGameVerTag('A21');
            
            expect(result.value).toBe('a21');
            expect(result.displayName).toBe('A21');
        });

        it('should strip extra V in legacy alpha formats (VA21 -> a21)', async () => {
            vi.mocked(db.tag.findUnique).mockResolvedValue(null);
            vi.mocked(db.tag.create).mockImplementation(({ data }: any) => Promise.resolve({ id: '3', ...data }));

            const result = await findOrCreateGameVerTag('VA21');
            
            expect(result.value).toBe('a21');
            expect(result.displayName).toBe('A21');
        });

        it('should handle N/A as na', async () => {
            vi.mocked(db.tag.findUnique).mockResolvedValue(null);
            vi.mocked(db.tag.create).mockImplementation(({ data }: any) => Promise.resolve({ id: '4', ...data }));

            const result = await findOrCreateGameVerTag('N/A');
            
            expect(result.value).toBe('na');
            expect(result.displayName).toBe('N/A');
        });
    });

    describe('findOrCreateAuthorTag', () => {
        it('should normalize author names with spaces (Khaine GB -> khaine_gb)', async () => {
            vi.mocked(db.tag.findUnique).mockResolvedValue(null);
            vi.mocked(db.tag.create).mockImplementation(({ data }: any) => Promise.resolve({ id: '5', ...data }));

            const result = await findOrCreateAuthorTag('Khaine GB');
            
            expect(result.value).toBe('khaine_gb');
            expect(result.displayName).toBe('Khaine GB');
        });
    });
});
