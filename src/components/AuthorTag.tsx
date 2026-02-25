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
            value={author}
            showIcon={true}
            href={href}
            className={`${className || ''} gap-1.5`}
        >
            {author}
        </Tag>
    );
}
