'use server';

import { db as prisma } from "@/lib/db";
import { TranslationSuggestion } from "@/types/mod";

export async function submitTranslationSuggestion(
    data: Omit<TranslationSuggestion, 'id' | 'status' | 'submittedAt'>
) {
    try {
        await prisma.translationSuggestion.create({
            data: {
                modSlug: data.modSlug,
                modName: data.modName,
                languageCode: data.languageCode,
                languageName: data.languageName,
                author: data.author,
                link: data.link,
            },
        });
        return true;
    } catch (error) {
        console.error("Failed to submit translation suggestion:", error);
        return false;
    }
}
