"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { useTranslations } from 'next-intl';
import DateDisplay from "@/components/DateDisplay";

interface DatePickerProps {
    value?: Date;
    onChange: (date?: Date) => void;
    placeholder?: string;
    className?: string;
    locale?: 'en' | 'ru';
}

interface CalendarDay {
    day: number;
    month: number; // 0 = previous, 1 = current, 2 = next
    date: Date;
}

export default function DatePicker({ value, onChange, placeholder, className, locale = 'en' }: DatePickerProps) {
    const t = useTranslations('DatePicker');
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => value || new Date());

    // Get calendar data for current view month (Notion-style with adjacent months)
    const getCalendarDays = (): CalendarDay[] => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        // First day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        // Previous month info
        const prevMonthLastDay = new Date(year, month, 0);
        const daysInPrevMonth = prevMonthLastDay.getDate();

        const days: CalendarDay[] = [];

        // Add days from previous month (greyed out)
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            days.push({
                day,
                month: 0, // previous month
                date: new Date(year, month - 1, day)
            });
        }

        // Add all days of the current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                month: 1, // current month
                date: new Date(year, month, i)
            });
        }

        // Add days from next month to fill 6 rows (42 cells)
        let nextDay = 1;
        while (days.length < 42) {
            days.push({
                day: nextDay,
                month: 2, // next month
                date: new Date(year, month + 1, nextDay)
            });
            nextDay++;
        }

        return days;
    };

    const handleDateSelect = (calendarDay: CalendarDay) => {
        onChange(calendarDay.date);
        setIsOpen(false); // Close picker after selection
    };

    const navigateMonth = (direction: -1 | 1) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    };

    const navigateYear = (direction: -1 | 1) => {
        setViewDate(prev => new Date(prev.getFullYear() + direction, prev.getMonth(), 1));
    };

    const isSelectedDay = (calendarDay: CalendarDay) => {
        if (!value) return false;
        return (
            value.getDate() === calendarDay.date.getDate() &&
            value.getMonth() === calendarDay.date.getMonth() &&
            value.getFullYear() === calendarDay.date.getFullYear()
        );
    };

    const isToday = (calendarDay: CalendarDay) => {
        const today = new Date();
        return (
            today.getDate() === calendarDay.date.getDate() &&
            today.getMonth() === calendarDay.date.getMonth() &&
            today.getFullYear() === calendarDay.date.getFullYear()
        );
    };

    // Reset view to selected date when picker opens
    const handleOpenChange = (open: boolean) => {
        if (open && value) {
            setViewDate(value);
        }
        setIsOpen(open);
    };

    const calendarDays = getCalendarDays();

    // Get localized month and day names
    const monthName = t(`months.${viewDate.getMonth()}`);
    const dayNames = [
        t('days.sun'), t('days.mon'), t('days.tue'),
        t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat')
    ];

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    className={`flex items-center gap-2 text-sm font-medium text-white px-2 py-1 rounded-md transition-colors outline-none group/date cursor-pointer ${className}`}
                >
                    {value ? (
                        <span className="border-b border-dotted border-white/30 group-hover/date:border-white/60">
                            <DateDisplay date={value.toISOString()} locale={locale} />
                        </span>
                    ) : (
                        <span className="text-textMuted italic">{placeholder || t('pickDate')}</span>
                    )}
                    <ChevronDown size={12} className="text-textMuted opacity-50" />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className="z-[100] bg-surface border border-white/10 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 w-[260px]"
                    align="start"
                    side="bottom"
                    sideOffset={5}
                >
                    {/* Header with month/year navigation */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-0.5">
                            <button
                                type="button"
                                onClick={() => navigateYear(-1)}
                                className="p-1.5 text-textMuted hover:text-white hover:bg-white/5 rounded transition-colors"
                                title={t('prevYear')}
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateMonth(-1)}
                                className="p-1.5 text-textMuted hover:text-white hover:bg-white/5 rounded transition-colors"
                                title={t('prevMonth')}
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </div>

                        <span className="text-sm font-bold text-white font-exo2">
                            {monthName} {viewDate.getFullYear()}
                        </span>

                        <div className="flex items-center gap-0.5">
                            <button
                                type="button"
                                onClick={() => navigateMonth(1)}
                                className="p-1.5 text-textMuted hover:text-white hover:bg-white/5 rounded transition-colors"
                                title={t('nextMonth')}
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateYear(1)}
                                className="p-1.5 text-textMuted hover:text-white hover:bg-white/5 rounded transition-colors"
                                title={t('nextYear')}
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-[10px] font-bold text-textMuted uppercase py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid - Notion style with adjacent months */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((calendarDay, idx) => (
                            <div key={idx} className="aspect-square">
                                <button
                                    type="button"
                                    onClick={() => handleDateSelect(calendarDay)}
                                    className={`w-full h-full flex items-center justify-center text-sm rounded-lg transition-all
                                        ${isSelectedDay(calendarDay)
                                            ? 'bg-primary text-white font-bold shadow-lg'
                                            : isToday(calendarDay)
                                                ? 'bg-white/10 text-white font-medium ring-1 ring-primary/50'
                                                : calendarDay.month === 1
                                                    ? 'text-textMain hover:bg-white/10 hover:text-white'
                                                    : 'text-white/30 hover:bg-white/5 hover:text-white/50'
                                        }
                                    `}
                                >
                                    {calendarDay.day}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Today button */}
                    <div className="mt-3 pt-2 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                onChange(today);
                                setIsOpen(false);
                            }}
                            className="w-full py-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors uppercase tracking-wider"
                        >
                            {t('today')}
                        </button>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
