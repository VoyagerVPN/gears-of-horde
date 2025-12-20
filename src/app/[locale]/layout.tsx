import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

// Настройка основного шрифта Exo 2
const exo2 = Exo_2({
  subsets: ["latin", "cyrillic"],
  variable: "--font-exo2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gears of Horde",
  description: "7 Days to Die Overhaul Catalog",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* Применяем переменную шрифта и подавляем ошибки гидратации от расширений */}
      <body className={`${exo2.className} antialiased bg-[#191919] text-[#ededed]`} suppressHydrationWarning={true}>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            <main className="min-h-screen pb-20">
              {children}
            </main>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}