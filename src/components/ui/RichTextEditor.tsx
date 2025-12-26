"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading1, List, LucideIcon } from "lucide-react";
import { useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { INVALID_INPUT_STYLE } from "@/lib/constants/ui-constants";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    id?: string;
    name?: string;
    invalid?: boolean;
    onClear?: () => void;
    variant?: "contained" | "seamless";
    label?: string;
    icon?: LucideIcon;
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
    invalid,
    onClear,
    variant = "contained",
    label,
    icon: Icon
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || '',
                emptyEditorClass: 'is-editor-empty',
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
                id: id ?? "",
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
            onClear?.();
        },
        onFocus: () => {
            onClear?.();
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

    const focusEditor = useCallback(() => {
        editor?.chain().focus().run();
    }, [editor]);

    if (!editor) {
        return (
            <div
                className={cn(
                    "bg-black/20 rounded-xl border border-white/5 animate-pulse",
                    className
                )}
                style={{ minHeight }}
            />
        );
    }

    const toolbar = (
        <div className={cn(
            "flex items-center gap-1",
            label ? "ml-4 border-l border-white/5 pl-4" : (variant === "contained" ? "p-1.5 bg-white/[0.02] border-b border-white/5" : "mb-1 px-0")
        )}>
            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5 gap-0.5">
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
            </div>

            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5 gap-0.5">
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
        </div>
    );

    // Card Layout (mimics SimpleTextEditor)
    if (label) {
        return (
            <div className={cn(
                "bg-surface border border-white/5 rounded-xl overflow-hidden transition-colors group",
                invalid ? "border-red-500/50" : "",
                className
            )}>
                {/* Header */}
                <div className="w-full flex items-center justify-start p-4 bg-white/[0.02] border-b border-white/5">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={20} className="text-primary" />}
                        <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide">
                            {label}
                        </h2>
                    </div>
                    {/* Toolbar in Header */}
                    {toolbar}
                </div>

                {/* Content */}
                <div
                    className="p-4 bg-black/20 cursor-text min-h-[150px] text-sm text-textMuted leading-relaxed flex flex-col"
                    onClick={focusEditor}
                >
                    <EditorContent editor={editor} className="flex-1" />
                    {name && <input type="hidden" name={name} value={editor.getHTML()} />}
                </div>

                <style jsx global>{`
                    .ProseMirror p.is-editor-empty:first-child::before {
                        content: attr(data-placeholder);
                        float: left;
                        color: rgba(255, 255, 255, 0.2);
                        pointer-events: none;
                        height: 0;
                    }
                    .ProseMirror:focus {
                        outline: none;
                    }
                    .ProseMirror {
                        min-height: 100%;
                        height: 100%;
                    }
                    .tiptap {
                        height: 100%;
                    }
                `}</style>
            </div>
        );
    }

    // Default Layout (Contained/Seamless)
    return (
        <div
            className={cn(
                "overflow-hidden transition-all flex flex-col",
                variant === "contained" && "rounded-xl border border-white/5 bg-black/20",
                variant === "seamless" && "",
                invalid ? INVALID_INPUT_STYLE : "",
                className
            )}
        >
            {/* Toolbar */}
            {toolbar}

            {/* Editor Content */}
            <div
                className={cn(
                    "p-4 cursor-text transition-colors flex-1 min-h-[inherit] text-sm text-textMuted leading-relaxed",
                    variant === "seamless" ? "bg-black/20 rounded-xl border border-white/5 hover:border-white/10" : ""
                )}
                style={{ minHeight }}
                onClick={focusEditor}
            >
                <EditorContent editor={editor} />
                {name && <input type="hidden" name={name} value={editor.getHTML()} />}
            </div>

            {/* Placeholder styling */}
            <style jsx global>{`
        .ProseMirror {
            min-height: 100%;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.2);
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
                "p-1.5 rounded-md transition-all",
                isActive
                    ? "text-white bg-white/10 shadow-sm"
                    : "text-textMuted hover:text-white hover:bg-white/5"
            )}
        >
            {children}
        </button>
    );
}

