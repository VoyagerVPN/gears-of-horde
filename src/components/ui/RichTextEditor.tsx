"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading1, List } from "lucide-react";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    id?: string;
    name?: string;
}
// Tiptap JSON content types
type TiptapNode = {
    type: string;
    content?: TiptapNode[];
    attrs?: Record<string, unknown>;
    text?: string;
};

/**
 * Convert markdown text to Tiptap JSON format
 * Handles: # headers, - bullet lists, regular paragraphs
 */
function markdownToTiptap(text: string): TiptapNode {
    // Normalize line endings and split
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    const content: TiptapNode[] = [];
    let listItems: TiptapNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            content.push({
                type: 'bulletList',
                content: listItems
            });
            listItems = [];
        }
    };

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines but flush any pending list
        if (trimmedLine === '') {
            flushList();
            continue;
        }

        // Convert headers: # Header
        const headerMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
        if (headerMatch) {
            flushList();
            const level = headerMatch[1].length;
            const headerContent = headerMatch[2].trim();
            content.push({
                type: 'heading',
                attrs: { level },
                content: [{ type: 'text', text: headerContent }]
            });
            continue;
        }

        // Convert bullet lists: - item or • item or * item
        const listMatch = trimmedLine.match(/^[-•*]\s+(.+)$/);
        if (listMatch) {
            const itemContent = listMatch[1].trim();
            listItems.push({
                type: 'listItem',
                content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: itemContent }]
                }]
            });
            continue;
        }

        // Regular paragraph
        flushList();
        content.push({
            type: 'paragraph',
            content: [{ type: 'text', text: trimmedLine }]
        });
    }

    // Flush any remaining list items
    flushList();

    return {
        type: 'doc',
        content: content.length > 0 ? content : [{ type: 'paragraph' }]
    };
}


/**
 * Rich Text Editor using Tiptap
 * Supports markdown paste conversion (# Header, - list items)
 * Compact toolbar with bold, italic, heading, bullet list
 */
export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Start typing...",
    className,
    minHeight = "100px",
    id,
    name,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-invert prose-sm max-w-none",
                    "focus:outline-none",
                    "text-textMuted leading-relaxed",
                    "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:my-2",
                    "[&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white [&_h2]:my-2",
                    "[&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-white [&_h3]:my-1",
                    "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
                    "[&_li]:text-textMuted [&_li]:my-0",
                    "[&_li>p]:my-0 [&_li>p]:inline",
                    "[&_p]:my-1",
                    "[&_strong]:text-white [&_strong]:font-bold",
                    "[&_em]:italic"
                ),
                id: id || undefined,
                "data-placeholder": placeholder,
            },
            // Custom paste handler for markdown conversion
            handlePaste: (view, event) => {
                const text = event.clipboardData?.getData('text/plain');
                if (!text) return false;

                // Check if text contains markdown patterns
                const hasMarkdown = /^#{1,3}\s+|^[-•*]\s+/m.test(text);

                if (hasMarkdown && editor) {
                    event.preventDefault();
                    const json = markdownToTiptap(text);
                    editor.commands.setContent(json);
                    return true;
                }

                return false; // Let default paste handling work
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const toggleBold = useCallback(() => {
        editor?.chain().focus().toggleBold().run();
    }, [editor]);

    const toggleItalic = useCallback(() => {
        editor?.chain().focus().toggleItalic().run();
    }, [editor]);

    const toggleHeading = useCallback(() => {
        editor?.chain().focus().toggleHeading({ level: 1 }).run();
    }, [editor]);

    const toggleBulletList = useCallback(() => {
        editor?.chain().focus().toggleBulletList().run();
    }, [editor]);

    if (!editor) {
        return (
            <div
                className={cn(
                    "bg-black/20 rounded-lg border border-white/5 animate-pulse",
                    className
                )}
                style={{ minHeight }}
            />
        );
    }

    return (
        <div
            className={cn(
                "bg-black/20 rounded-lg border border-white/5 overflow-hidden",
                className
            )}
        >
            {/* Compact Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-black/10">
                <ToolbarButton
                    onClick={toggleBold}
                    isActive={editor.isActive("bold")}
                    title="Bold"
                >
                    <Bold size={14} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={toggleItalic}
                    isActive={editor.isActive("italic")}
                    title="Italic"
                >
                    <Italic size={14} />
                </ToolbarButton>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <ToolbarButton
                    onClick={toggleHeading}
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading"
                >
                    <Heading1 size={14} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={toggleBulletList}
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List size={14} />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <div className="p-3" style={{ minHeight }}>
                <EditorContent editor={editor} />
                {/* Hidden input for form submission */}
                {name && (
                    <input type="hidden" name={name} value={editor.getHTML()} />
                )}
            </div>

            {/* Placeholder styling */}
            <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.1);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
        </div>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "p-1.5 rounded transition-colors",
                isActive
                    ? "text-white bg-white/10"
                    : "text-textMuted hover:text-white hover:bg-white/10"
            )}
        >
            {children}
        </button>
    );
}

