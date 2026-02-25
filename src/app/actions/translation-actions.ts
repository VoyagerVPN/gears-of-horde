'use server';


import { TranslationSuggestion } from "@/types/mod";
import { db } from "@/lib/db";

export async function submitTranslationSuggestion(
    data: Omit<TranslationSuggestion, 'id' | 'status' | 'submittedAt'>
): Promise<boolean> {
    try {
        const { error } = await db.from('TranslationSuggestion').insert({
            modSlug: data.modSlug,
            modName: data.modName,
            languageCode: data.languageCode,
            languageName: data.languageName,
            author: data.author,
            link: data.link,
        });

        if (error) {
            console.error("Failed to submit translation suggestion:", error.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Failed to submit translation suggestion:", error);
        return false;
    }
}
