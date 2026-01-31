"use client"

import { useTranslations, useLocale } from 'next-intl';
import { Menu } from 'lucide-react';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AuthButton from "@/components/AuthButton";
import SearchBar from "@/components/ui/SearchBar";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import Banner from "@/images/Banner.png";

export default function Navbar() {
  const t = useTranslations('Navigation');
  const tA11y = useTranslations('Accessibility');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Sync search query with URL when on mods page
  const urlQuery = searchParams.get('q') || '';
  const isOnModsPage = pathname.includes('/mods');

  const [query, setQuery] = useState("");

  // Sync search query with URL when on mods page
  useEffect(() => {
    if (isOnModsPage) {
      setQuery(urlQuery);
    }
  }, [isOnModsPage, urlQuery]);

  return (
    <nav
      className="border-b border-surface bg-background sticky top-0 z-50 h-20"
      role="navigation"
      aria-label={tA11y('mainNavigation')}
    >
      <div className="max-w-[1920px] mx-auto px-6 h-full flex items-center gap-8">
        {/* Banner - Left */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src={Banner}
            alt="Gears of Horde"
            height={56} // Increased height for banner
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation Links - Left of Search */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-textMuted">
          <div className="w-px h-8 bg-white/10" /> {/* Divider */}
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <div className="w-px h-8 bg-white/10" /> {/* Divider */}
          <Link href="/info" className="hover:text-white transition-colors">
            Info
          </Link>
        </div>

        {/* Search - Center */}
        <div className="flex-1 px-4 min-w-0">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t('searchPlaceholder')}
            showTagSuggestions={true}
            locale={locale}
          />
        </div>

        {/* Actions - Right */}
        <div className="flex items-center gap-4 shrink-0 ml-auto">
          <LanguageSwitcher />
          <AuthButton />
          <button
            className="md:hidden p-2 text-textMuted hover:text-white"
            aria-label={tA11y('openMenu')}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}

