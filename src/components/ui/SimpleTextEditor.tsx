"use client";

import { useState, useEffect } from "react";
import { LucideIcon, ChevronDown } from "lucide-react";

interface SimpleTextEditorProps {
  title: string;
  icon: LucideIcon;
  items: string[];
  onChange: (newItems: string[]) => void;
  placeholder?: string;
  countLabel?: string;
  defaultExpanded?: boolean;
  id?: string;
  name?: string;
}

export default function SimpleTextEditor({
  title,
  icon: Icon,
  items,
  onChange,
  placeholder = "Enter items, one per line...",
  countLabel = "items",
  defaultExpanded = true,
  id,
  name
}: SimpleTextEditorProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [textValue, setTextValue] = useState(() => items.join("\n"));
  const [isFocused, setIsFocused] = useState(false);

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
          <Icon size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
            {title}
            {items.length > 0 && (
              <span className="text-xs text-textMuted font-mono bg-white/10 px-2 py-0.5 rounded-full tracking-normal">
                {items.length} {countLabel}
              </span>
            )}
          </h2>
        </div>
        <ChevronDown size={20} className={`text-textMuted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="p-4 bg-black/20">
          <textarea
            id={id}
            name={name}
            rows={Math.max(6, items.length + 1)}
            value={textValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            className="w-full bg-transparent text-textMuted leading-relaxed text-sm outline-none resize-y placeholder:text-white/10 transition-colors font-mono"
            placeholder={placeholder}
          />
          <p className="text-[10px] text-textMuted mt-2 italic opacity-50">
            Tip: Enter each item on a new line. Empty lines are ignored.
          </p>
        </div>
      )}
    </div>
  );
}