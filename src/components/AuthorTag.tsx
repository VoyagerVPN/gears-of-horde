import { CircleUser } from "lucide-react";
import Tag from "@/components/ui/Tag";

interface AuthorTagProps {
    author: string;
    className?: string;
    href?: string;
}

/**
 * Author Tag Component
 * 
 * Displays author name with CircleUser icon and consistent styling.
 * Similar to VersionTag, but for author display.
 */
export default function AuthorTag({ author, className, href }: AuthorTagProps) {
    if (!author) return null;

    return (
        <Tag
            category="author"
            href={href}
            className={`${className || ''} gap-1.5`}
        >
            <CircleUser size={14} />
            {author}
        </Tag>
    );
}
