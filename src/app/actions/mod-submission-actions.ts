'use server';


import {
    ModSubmissionCreateSchema,
    type ModSubmission,
    type ModData,
    type TagData,
    type ModChangelog,
    type ModLocalization
} from "@/schemas";
import { validate, ok, err, type Result } from "@/lib/result";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";

const SUBMISSION_SELECT = `
    *,
    submitter:User!submitterId(name, image)
`;

/**
 * Submit a new mod for review (Developer role required)
 */
export async function submitModSuggestion(rawData: unknown): Promise<Result<{ id: string }>> {
    const preprocessedData = rawData; // Pre-processing if needed
    const validated = validate(ModSubmissionCreateSchema, preprocessedData);
    if (!validated.success) {
        return validated;
    }
    const data = validated.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return err("Not authenticated");
    }

    const { data: dbUser } = await db
        .from('User')
        .select('role, isBanned')
        .eq('id', user.id)
        .single();

    if (!dbUser || dbUser.isBanned) {
        return err("Account not found or banned");
    }

    const { data: existingMod } = await db.from('Mod').select('slug').eq('slug', data.slug).maybeSingle();
    const { data: existingSubmission } = await db.from('ModSubmission').select('slug').eq('slug', data.slug).maybeSingle();

    if (existingMod) {
        return err("A mod with this slug already exists");
    }

    if (existingSubmission) {
        return err("A submission with this slug is already pending");
    }

    try {
        const { data: submission, error } = await db
            .from('ModSubmission')
            .insert({
                title: data.title,
                slug: data.slug,
                version: data.version,
                author: data.author,
                description: data.description,
                gameVersion: data.gameVersion,
                bannerUrl: data.bannerUrl || null,
                isSaveBreaking: data.isSaveBreaking,
                features: data.features,
                installationSteps: data.installationSteps,
                links: data.links,
                videos: data.videos,
                changelog: data.changelog,
                localizations: data.localizations,
                screenshots: data.screenshots,
                tags: data.tags,
                submitterId: user.id,
                submitterNote: data.submitterNote || null,
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath(ROUTES.mods);
        revalidatePath('/author');

        return ok({ id: submission.id });
    } catch (error) {
        console.error("Failed to submit mod:", error);
        return err("Failed to submit mod");
    }
}

/**
 * Fetch all pending mod submissions (Admin only)
 */
export async function fetchPendingModSubmissions(): Promise<ModSubmission[]> {
    const { data: submissions } = await db
        .from('ModSubmission')
        .select(SUBMISSION_SELECT)
        .eq('status', 'pending')
        .order('submittedAt', { ascending: false });

    return (submissions || []).map((s) => {
        const item = s as unknown as Record<string, unknown>;
        return {
            id: item.id as string,
            title: item.title as string,
            slug: item.slug as string,
            version: item.version as string,
            author: item.author as string,
            description: item.description as string,
            gameVersion: item.gameVersion as string,
            bannerUrl: (item.bannerUrl as string | null) || undefined,
            isSaveBreaking: item.isSaveBreaking as boolean,
            features: item.features as string[],
            installationSteps: item.installationSteps as string[],
            links: item.links as unknown as ModData['links'],
            videos: item.videos as unknown as ModData['videos'],
            changelog: item.changelog as unknown as ModChangelog[],
            localizations: item.localizations as unknown as ModLocalization[],
            screenshots: item.screenshots as string[],
            tags: item.tags as unknown as TagData[],
            submitterId: item.submitterId as string,
            submitterName: (item.submitter as { name?: string })?.name || 'Unknown',
            submitterImage: (item.submitter as { image?: string })?.image || undefined,
            submitterNote: (item.submitterNote as string | null) || undefined,
            status: item.status as 'pending' | 'approved' | 'rejected',
            rejectionReason: (item.rejectionReason as string | null) || undefined,
            submittedAt: new Date(item.submittedAt as string | number | Date).toISOString(),
            reviewedAt: item.reviewedAt ? new Date(item.reviewedAt as string | number | Date).toISOString() : undefined
        };
    });
}

/**
 * Fetch a single mod submission by ID
 */
export async function fetchModSubmissionById(id: string): Promise<ModSubmission | null> {
    const { data: s } = await db
        .from('ModSubmission')
        .select(SUBMISSION_SELECT)
        .eq('id', id)
        .maybeSingle();

    if (!s) return null;

    return {
        id: s.id,
        title: s.title,
        slug: s.slug,
        version: s.version,
        author: s.author,
        description: s.description,
        gameVersion: s.gameVersion,
        bannerUrl: s.bannerUrl || undefined,
        isSaveBreaking: s.isSaveBreaking,
        features: s.features,
        installationSteps: s.installationSteps,
        links: s.links as unknown as ModData['links'],
        videos: s.videos as unknown as ModData['videos'],
        changelog: s.changelog as unknown as ModChangelog[],
        localizations: s.localizations as unknown as ModLocalization[],
        screenshots: s.screenshots,
        tags: s.tags as unknown as TagData[],
        submitterId: s.submitterId,
        submitterName: (s.submitter as { name?: string })?.name || 'Unknown',
        submitterImage: (s.submitter as { image?: string })?.image || undefined,
        submitterNote: s.submitterNote || undefined,
        status: s.status as 'pending' | 'approved' | 'rejected',
        rejectionReason: s.rejectionReason || undefined,
        submittedAt: new Date(s.submittedAt).toISOString(),
        reviewedAt: s.reviewedAt ? new Date(s.reviewedAt).toISOString() : undefined
    };
}

/**
 * Mark submission as approved
 */
export async function approveModSubmission(id: string) {
    try {
        const { error } = await db
            .from('ModSubmission')
            .update({
                status: 'approved',
                reviewedAt: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath(ROUTES.mods);
        revalidatePath('/author');

        return { success: true };
    } catch (error) {
        console.error("Failed to approve submission:", error);
        return { success: false, error: "Failed to approve submission" };
    }
}

/**
 * Reject a mod submission with reason
 */
export async function rejectModSubmission(id: string, reason: string) {
    try {
        const { error } = await db
            .from('ModSubmission')
            .update({
                status: 'rejected',
                rejectionReason: reason,
                reviewedAt: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath(ROUTES.mods);
        revalidatePath('/author');

        return { success: true };
    } catch (error) {
        console.error("Failed to reject submission:", error);
        return { success: false, error: "Failed to reject submission" };
    }
}

/**
 * Fetch submissions for current user (Author dashboard)
 */
export async function fetchMySubmissions(): Promise<ModSubmission[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data: submissions } = await db
        .from('ModSubmission')
        .select(SUBMISSION_SELECT)
        .eq('submitterId', user.id)
        .order('submittedAt', { ascending: false });

    return (submissions || []).map((s) => {
        const item = s as unknown as Record<string, unknown>;
        return {
            id: item.id as string,
            title: item.title as string,
            slug: item.slug as string,
            version: item.version as string,
            author: item.author as string,
            description: item.description as string,
            gameVersion: item.gameVersion as string,
            bannerUrl: (item.bannerUrl as string | null) || undefined,
            isSaveBreaking: item.isSaveBreaking as boolean,
            features: item.features as string[],
            installationSteps: item.installationSteps as string[],
            links: item.links as unknown as ModData['links'],
            videos: item.videos as unknown as ModData['videos'],
            changelog: item.changelog as unknown as ModChangelog[],
            localizations: item.localizations as unknown as ModLocalization[],
            screenshots: item.screenshots as string[],
            tags: item.tags as unknown as TagData[],
            submitterId: item.submitterId as string,
            submitterName: (item.submitter as { name?: string })?.name || 'Unknown',
            submitterImage: (item.submitter as { image?: string })?.image || undefined,
            submitterNote: (item.submitterNote as string | null) || undefined,
            status: item.status as 'pending' | 'approved' | 'rejected',
            rejectionReason: (item.rejectionReason as string | null) || undefined,
            submittedAt: new Date(item.submittedAt as string | number | Date).toISOString(),
            reviewedAt: item.reviewedAt ? new Date(item.reviewedAt as string | number | Date).toISOString() : undefined
        };
    });
}
