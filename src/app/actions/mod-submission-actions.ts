'use server';

import { db as prisma } from "@/lib/db";
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
import { auth } from "@/auth";

/**
 * Submit a new mod for review (Developer role required)
 */
export async function submitModSuggestion(rawData: unknown): Promise<Result<{ id: string }>> {
    // Validate input with Zod
    const validated = validate(ModSubmissionCreateSchema, rawData);
    if (!validated.success) {
        return validated;
    }
    const data = validated.data;

    const session = await auth();

    if (!session?.user?.id) {
        return err("Not authenticated");
    }

    // Check if user has Author role or higher
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isBanned: true }
    });

    if (!user || user.isBanned) {
        return err("Account not found or banned");
    }

    // Allow all users to submit mods
    // if (!['DEVELOPER', 'MODERATOR', 'ADMIN'].includes(user.role)) {
    //     return err("Developer role required to submit mods");
    // }

    // Check if slug already exists (in mods or pending submissions)
    const existingMod = await prisma.mod.findUnique({ where: { slug: data.slug } });
    const existingSubmission = await prisma.modSubmission.findUnique({ where: { slug: data.slug } });

    if (existingMod) {
        return err("A mod with this slug already exists");
    }

    if (existingSubmission) {
        return err("A submission with this slug is already pending");
    }

    try {
        const submission = await prisma.modSubmission.create({
            data: {
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
                // Zod validates these, Prisma accepts as Json
                links: data.links,
                videos: data.videos,
                changelog: data.changelog,
                localizations: data.localizations,
                screenshots: data.screenshots,
                tags: data.tags,
                submitterId: session.user.id,
                submitterNote: data.submitterNote || null,
            }
        });

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
    const submissions = await prisma.modSubmission.findMany({
        where: { status: 'pending' },
        orderBy: { submittedAt: 'desc' },
        include: {
            submitter: {
                select: { name: true, image: true }
            }
        }
    });

    return submissions.map(s => ({
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
        submitterName: s.submitter.name || 'Unknown',
        submitterImage: s.submitter.image || undefined,
        submitterNote: s.submitterNote || undefined,
        status: s.status as 'pending' | 'approved' | 'rejected',
        rejectionReason: s.rejectionReason || undefined,
        submittedAt: s.submittedAt.toISOString(),
        reviewedAt: s.reviewedAt?.toISOString()
    }));
}

/**
 * Fetch a single mod submission by ID
 */
export async function fetchModSubmissionById(id: string): Promise<ModSubmission | null> {
    const s = await prisma.modSubmission.findUnique({
        where: { id },
        include: {
            submitter: {
                select: { name: true, image: true }
            }
        }
    });

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
        submitterName: s.submitter.name || 'Unknown',
        submitterImage: s.submitter.image || undefined,
        submitterNote: s.submitterNote || undefined,
        status: s.status as 'pending' | 'approved' | 'rejected',
        rejectionReason: s.rejectionReason || undefined,
        submittedAt: s.submittedAt.toISOString(),
        reviewedAt: s.reviewedAt?.toISOString()
    };
}

/**
 * Mark submission as approved (actual mod creation happens via normal mod save)
 */
export async function approveModSubmission(id: string) {
    try {
        await prisma.modSubmission.update({
            where: { id },
            data: {
                status: 'approved',
                reviewedAt: new Date()
            }
        });

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
        await prisma.modSubmission.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectionReason: reason,
                reviewedAt: new Date()
            }
        });

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
    const session = await auth();

    if (!session?.user?.id) {
        return [];
    }

    const submissions = await prisma.modSubmission.findMany({
        where: { submitterId: session.user.id },
        orderBy: { submittedAt: 'desc' },
        include: {
            submitter: {
                select: { name: true, image: true }
            }
        }
    });

    return submissions.map(s => ({
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
        submitterName: s.submitter.name || 'Unknown',
        submitterImage: s.submitter.image || undefined,
        submitterNote: s.submitterNote || undefined,
        status: s.status as 'pending' | 'approved' | 'rejected',
        rejectionReason: s.rejectionReason || undefined,
        submittedAt: s.submittedAt.toISOString(),
        reviewedAt: s.reviewedAt?.toISOString()
    }));
}
