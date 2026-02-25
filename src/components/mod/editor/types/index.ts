"use client";

import { ModData, TagData } from "@/schemas";

export interface VisualModEditorProps {
    initialData?: ModData;
    isNew?: boolean;
    submissionId?: string;
}

export interface DraftExtraData {
    tempGameVersionTags?: TagData[];
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: string[];
}
