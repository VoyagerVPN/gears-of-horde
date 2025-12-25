"use client"

import { useTranslations, useLocale } from 'next-intl';
import { Menu } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AuthButton from "@/components/AuthButton";
import SearchBar from "@/components/ui/SearchBar";
import { useState, FormEvent } from "react";
import Image from "next/image";
import Logo from "@/images/Logo.png";

export default function Navbar() {
  const t = useTranslations('Navigation');
  const tA11y = useTranslations('Accessibility');
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
    <nav
      className="border-b border-surface bg-background sticky top-0 z-50"
      role="navigation"
      aria-label={tA11y('mainNavigation')}
    >
      <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src={Logo}
            alt="Gears of Horde"
            width={40}
            height={40}
            className="rounded-lg"
            priority
          />
          <span className="text-xl font-locust tracking-wider text-primary drop-shadow-sm hidden sm:block">
            GEARS OF HORDE
          </span>
        </Link>

        {/* Search - Center */}
        <div className="flex-1 flex justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="hidden md:block w-full max-w-md"
            role="search"
          >
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={t('searchPlaceholder')}
              showTagSuggestions={true}
              locale={locale}
            />
          </form>
        </div>

        {/* Actions - Right */}
        <div className="flex items-center gap-4 shrink-0">
          <LanguageSwitcher />
          <AuthButton />
          <button
            className="md:hidden p-2"
            aria-label={tA11y('openMenu')}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}

