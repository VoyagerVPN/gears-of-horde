"use client"; // Required for client-side date rendering

import { formatSmartDate, formatFullDateTime } from "@/lib/dateUtils";
import { useEffect, useState } from "react";

interface DateDisplayProps {
  date: string;
  locale?: 'en' | 'ru';
  className?: string;
}

export default function DateDisplay({ date, locale = 'en', className = "" }: DateDisplayProps) {
  const [displayDate, setDisplayDate] = useState<string>("");
  const [fullDate, setFullDate] = useState<string>("");

  useEffect(() => {
    setDisplayDate(formatSmartDate(date, locale));
    setFullDate(formatFullDateTime(date, locale));
  }, [date, locale]);

  // While date is not calculated on client, render placeholder
  // to avoid Hydration Mismatch with server
  if (!displayDate) return <span className={className}>...</span>;

  return (
    <span
      className={`cursor-help border-b border-dotted border-white/20 hover:border-white/50 transition-colors ${className}`}
      title={fullDate}
    >
      {displayDate}
    </span>
  );
}