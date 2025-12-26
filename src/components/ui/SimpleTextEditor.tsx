"use client";

import { useState, useEffect, useRef } from "react";
import { LucideIcon, ChevronDown, Info } from "lucide-react";

interface SimpleTextEditorProps {
  title: string;
  icon: LucideIcon;
  items: string[];
  onChange: (newItems: string[]) => void;
  placeholder?: string;
  countLabel?: string;
  defaultExpanded?: boolean;
  minHeight?: string;
  tooltip?: string;
  id?: string;
  name?: string;
}

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export default function SimpleTextEditor({
  title,
  icon: Icon,
  items,
  onChange,
  placeholder = "Enter items, one per line...",
  countLabel = "items",
  defaultExpanded = true,
  minHeight = "150px",
  tooltip,
  id,
  name
}: SimpleTextEditorProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [textValue, setTextValue] = useState(() => items.join("\n"));
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Only sync from parent when not focused (to avoid cursor jumping)
  useEffect(() => {
    if (!isFocused) {
      setTextValue(items.join("\n"));
    }
  }, [items, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Process and send to parent only on blur
    const newArray = textValue
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
    onChange(newArray);
  };

  return (
    <div className="bg-surface border border-white/5 rounded-xl overflow-hidden transition-colors group">
      {/* ИСПРАВЛЕНО: Весь хедер теперь кнопка */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5 hover:bg-white/[0.04] transition-colors text-left outline-none"
      >
        <div className="flex items-center gap-2">
          <Icon size={20} className="text-primary shrink-0" />
          <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs text-textMuted font-mono bg-white/10 px-2 py-0.5 rounded-full tracking-normal min-w-[20px] h-5 flex items-center justify-center">
              {items.length}
            </span>{tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <div className="text-textMuted hover:text-white transition-colors cursor-help p-1 rounded-full hover:bg-white/10 flex items-center justify-center">
                      <Info size={16} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] text-center bg-black/90 border-white/10 backdrop-blur-sm normal-case">
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h2>
        </div>
        <ChevronDown size={20} className={`text-textMuted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div
          className="p-4 bg-black/20 cursor-text flex flex-col"
          onClick={() => textareaRef.current?.focus()}
          style={{ minHeight }}
        >
          <textarea
            ref={textareaRef}
            id={id}
            name={name}
            rows={Math.max(6, items.length + 1)}
            value={textValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            className="w-full h-full bg-transparent text-textMuted leading-relaxed text-sm outline-none resize-none placeholder:text-white/20 transition-colors flex-1"
            placeholder={placeholder}
            style={{ minHeight: "100%" }}
          />
        </div>
      )}
    </div>
  );
}