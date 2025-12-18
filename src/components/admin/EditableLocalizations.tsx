"use client";

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { Languages, Plus, X, Link as LinkIcon, Check, Search } from "lucide-react";
import { ModLocalization } from "@/types/mod";
import { searchLanguages, createLanguage, LanguageData } from "@/app/actions/language-actions";

interface EditableLocalizationsProps {
  items: ModLocalization[];
  onChange: (newItems: ModLocalization[]) => void;
}

export default function EditableLocalizations({ items, onChange }: EditableLocalizationsProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LanguageData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search languages as user types
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchLanguages(searchQuery);
      // Filter out already selected languages (compare by name)
      const filtered = results.filter(
        r => !items.some(item => item.name.toLowerCase() === r.name.toLowerCase())
      );
      setSuggestions(filtered);
    } catch (error) {
      console.error("Error searching languages:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add a language to the list
  const addLanguage = async (name: string) => {
    if (!name.trim()) return;
    if (items.some(item => item.name.toLowerCase() === name.toLowerCase())) return;

    // Create language in DB if it doesn't exist
    await createLanguage(name);

    const newItem: ModLocalization = {
      code: name.toLowerCase().replace(/\s+/g, '_'), // Generate code from name
      name: name.trim(),
      type: 'external', // Default to external
      url: ""
    };

    onChange([...items, newItem]);
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  // Update a language's properties (use name as identifier)
  const updateLanguage = (name: string, updates: Partial<ModLocalization>) => {
    onChange(items.map(item =>
      item.name === name ? { ...item, ...updates } : item
    ));
  };

  // Remove a language
  const removeLanguage = (name: string) => {
    // Don't allow removing English
    if (name.toLowerCase() === 'english') return;
    onChange(items.filter(item => item.name !== name));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        addLanguage(suggestions[0].name);
      } else if (query.trim()) {
        addLanguage(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery("");
    }
  };

  // Sort items: built-in first
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === 'builtin' && b.type !== 'builtin') return -1;
    if (a.type !== 'builtin' && b.type === 'builtin') return 1;
    return 0;
  });

  return (
    <div className="pt-3 border-t border-white/5 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-[10px] text-textMuted uppercase tracking-wider font-exo2">
        <Languages size={12} /> Languages & Localizations
      </div>

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-primary placeholder:text-white/30 transition-colors"
            placeholder="Search or add language..."
          />
          {isLoading && (
            <div className="absolute right-3">
              <div className="w-4 h-4 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && query.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {/* Search results */}
            {suggestions.length > 0 && (
              <div className="p-2 border-b border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                  Suggestions
                </div>
                {suggestions.map(lang => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => addLanguage(lang.name)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-left transition-colors group"
                  >
                    <span className="text-white">{lang.name}</span>
                    <span className="text-[10px] text-textMuted ml-auto">
                      {lang.usageCount} mods
                    </span>
                    <Plus size={12} className="text-textMuted group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {/* Create new language option */}
            {query && !suggestions.some(s => s.name.toLowerCase() === query.toLowerCase()) && (
              <button
                type="button"
                onClick={() => addLanguage(query.trim())}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left transition-colors"
              >
                <Plus size={14} className="text-primary" />
                <span className="text-sm text-white">
                  Add "<span className="text-primary">{query}</span>"
                </span>
              </button>
            )}

            {/* No results */}
            {query && suggestions.length === 0 && !isLoading && (
              <div className="p-3 text-center text-sm text-textMuted">
                No languages found. Press Enter to create.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Languages */}
      {sortedItems.length > 0 && (
        <div className="space-y-2">
          {sortedItems.map((loc, index) => (
            <div
              key={loc.name || loc.code || `lang-${index}`}
              className="flex items-center gap-2 p-2 bg-black/20 border border-white/10 rounded-lg"
            >
              {/* Language name */}
              <span className="text-white text-sm">{loc.name}</span>

              {/* Built-in toggle */}
              <button
                type="button"
                onClick={() => updateLanguage(loc.name, {
                  type: loc.type === 'builtin' ? 'external' : 'builtin',
                  url: loc.type === 'builtin' ? loc.url : '' // Clear URL when switching to built-in
                })}
                className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border transition-colors ${loc.type === 'builtin'
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-textMuted hover:border-white/20"
                  }`}
              >
                <Check size={10} className={loc.type === 'builtin' ? "opacity-100" : "opacity-30"} />
                Built-in
              </button>

              {/* URL input for external */}
              {loc.type === 'external' && (
                <div className="flex-1 relative">
                  <LinkIcon size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-textMuted opacity-50" />
                  <input
                    type="text"
                    value={loc.url || ""}
                    onChange={(e) => updateLanguage(loc.name, { url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded pl-7 pr-2 py-1 text-xs text-white outline-none focus:border-primary/50 placeholder:text-textMuted/30 transition-colors"
                    placeholder="Download URL..."
                  />
                </div>
              )}

              {/* Remove button (not for English) */}
              {loc.name.toLowerCase() !== 'english' && (
                <button
                  type="button"
                  onClick={() => removeLanguage(loc.name)}
                  className="shrink-0 p-1 text-textMuted hover:text-red-400 hover:bg-white/5 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-3 text-[10px] text-textMuted italic opacity-50">
          No languages added. Start typing to search or create.
        </div>
      )}
    </div>
  );
}