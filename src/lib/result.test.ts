import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ok, err, validate, parseOrNull } from './result';

describe('Result Utilities', () => {
    describe('ok()', () => {
        it('should create a success result', () => {
            const data = { id: 1, name: 'Test' };
            const result = ok(data);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(data);
            }
        });
    });

    describe('err()', () => {
        it('should create an error result', () => {
            const message = 'Something went wrong';
            const result = err(message);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(message);
            }
        });

        it('should include field errors if provided', () => {
            const fieldErrors = { email: ['Invalid format'] };
            const result = err('Validation failed', fieldErrors);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.fieldErrors).toEqual(fieldErrors);
            }
        });
    });

    describe('validate()', () => {
        const schema = z.object({
            id: z.number(),
            email: z.string().email()
        });

        it('returns ok for valid data', () => {
            const data = { id: 1, email: 'test@example.com' };
            const result = validate(schema, data);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(data);
            }
        });

        it('returns err with formatted message for invalid data', () => {
            const data = { id: 'not-a-number', email: 'invalid-email' };
            const result = validate(schema, data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain('id');
                expect(result.error).toContain('email');
                expect(result.fieldErrors).toHaveProperty('id');
                expect(result.fieldErrors).toHaveProperty('email');
            }
        });
    });

    describe('parseOrNull()', () => {
        const schema = z.string();

        it('returns data if valid', () => {
            expect(parseOrNull(schema, 'hello')).toBe('hello');
        });

        it('returns null if invalid', () => {
            expect(parseOrNull(schema, 123)).toBe(null);
        });
    });
});
