/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findOrCreateGameVerTag, findOrCreateAuthorTag } from './tag-utils';

// Create a chainable mock object
const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
};

// Mock the Supabase client
vi.mock('./db', () => ({
    db: {
        from: vi.fn(() => mockQueryBuilder),
    }
}));

describe('Tag Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset all methods on the mock builder
        mockQueryBuilder.select.mockReturnThis();
        mockQueryBuilder.eq.mockReturnThis();
        mockQueryBuilder.insert.mockReturnThis();
        mockQueryBuilder.limit.mockReturnThis();
        mockQueryBuilder.ilike.mockReturnThis();
        mockQueryBuilder.in.mockReturnThis();
        mockQueryBuilder.delete.mockReturnThis();
        mockQueryBuilder.update.mockReturnThis();
        mockQueryBuilder.single.mockReset();
        mockQueryBuilder.maybeSingle.mockReset();
    });

    describe('findOrCreateGameVerTag', () => {
        it('should normalize standard V versions correctly (V1.0 -> 1_0)', async () => {
            // SAFETY: Supabase mock result
            vi.mocked(mockQueryBuilder.single).mockResolvedValue({ data: null, error: { code: 'PGRST116' } } as any);
            // Mock insert returning data
            // SAFETY: Supabase mock result
            vi.mocked(mockQueryBuilder.single).mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } } as any) // for select
                               // SAFETY: Supabase mock result
                               .mockResolvedValueOnce({ data: { 
                                    id: '1', 
                                    category: 'gamever', 
                                    value: '1_0',
                                    displayName: 'V1.0',
                                    color: null
                                }, error: null } as any); // for insert result

            const result = await findOrCreateGameVerTag('V1.0');
            
            expect(result.value).toBe('1_0');
            expect(result.displayName).toBe('V1.0');
        });

        it('should handle alpha versions (A21 -> a21)', async () => {
            // SAFETY: Supabase mock result
            vi.mocked(mockQueryBuilder.single).mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } } as any)
                               // SAFETY: Supabase mock result
                               .mockResolvedValueOnce({ data: { 
                                    id: '2', 
                                    category: 'gamever',
                                    value: 'a21',
                                    displayName: 'A21',
                                    color: null
                                }, error: null } as any);

            const result = await findOrCreateGameVerTag('A21');
            
            expect(result.value).toBe('a21');
            expect(result.displayName).toBe('A21');
        });

        it('should strip extra V in legacy alpha formats (VA21 -> a21)', async () => {
             // SAFETY: Supabase mock result
             vi.mocked(mockQueryBuilder.single).mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } } as any)
                               // SAFETY: Supabase mock result
                               .mockResolvedValueOnce({ data: { 
                                    id: '3', 
                                    category: 'gamever',
                                    value: 'a21',
                                    displayName: 'A21',
                                    color: null
                                }, error: null } as any);

            const result = await findOrCreateGameVerTag('VA21');
            
            expect(result.value).toBe('a21');
            expect(result.displayName).toBe('A21');
        });

        it('should handle N/A as na', async () => {
            // SAFETY: Supabase mock result
            vi.mocked(mockQueryBuilder.single).mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } } as any)
                               // SAFETY: Supabase mock result
                               .mockResolvedValueOnce({ data: { 
                                    id: '5', 
                                    category: 'gamever',
                                    value: 'na',
                                    displayName: 'N/A',
                                    color: null
                                }, error: null } as any);

            const result = await findOrCreateGameVerTag('N/A');
            
            expect(result.value).toBe('na');
            expect(result.displayName).toBe('N/A');
        });
    });

    describe('findOrCreateAuthorTag', () => {
        it('should normalize author names with spaces (Khaine GB -> khaine_gb)', async () => {
            // SAFETY: Supabase mock result
            vi.mocked(mockQueryBuilder.single).mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } } as any)
                               // SAFETY: Supabase mock result
                               .mockResolvedValueOnce({ data: { 
                                    id: '4', 
                                    category: 'author',
                                    value: 'khaine_gb',
                                    displayName: 'Khaine GB',
                                    color: null
                                }, error: null } as any);

            const result = await findOrCreateAuthorTag('Khaine GB');
            
            expect(result.value).toBe('khaine_gb');
            expect(result.displayName).toBe('Khaine GB');
        });
    });
});
