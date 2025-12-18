"use client"

import { useTranslations, useLocale } from 'next-intl';
import { Menu } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AuthButton from "@/components/AuthButton";
import SearchBar from "@/components/ui/SearchBar";
import { useState, FormEvent } from "react";

export default function Navbar() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="border-b border-surface bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-locust tracking-wider text-primary drop-shadow-sm shrink-0">
          GEARS OF HORDE
        </Link>

        {/* Search with tag autocomplete */}
        <form
          onSubmit={handleSubmit}
          className="hidden md:block flex-1"
          style={{ maxWidth: '400px' }}
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t('searchPlaceholder')}
            showTagSuggestions={true}
            locale={locale}
          />
        </form>

        {/* Spacer to push actions to the right */}
        <div className="flex-1 hidden md:block" />

        {/* Actions */}
        <div className="flex items-center gap-4 shrink-0 ml-auto">
          <LanguageSwitcher />
          <AuthButton />
          <button className="md:hidden p-2">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
