"use client";

import { useMemo } from 'react';
import { getDaysInMonth, startOfMonth, getDay } from 'date-fns';

interface ExpenseCalendarProps {
    currentDate: Date;
    dailyStats: { day: number; total: number }[];
    onDayClick?: (day: number) => void;
}

export function ExpenseCalendar({ currentDate, dailyStats, onDayClick }: ExpenseCalendarProps) {
    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentDate);
        const startDay = getDay(startOfMonth(currentDate)); // 0 = Sunday, 1 = Monday, etc.

        const days = [];

        // Add empty slots for days before the start of the month
        for (let i = 0; i < startDay; i++) {
            days.push({ day: null, total: 0 });
        }

        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const stat = dailyStats.find(d => d.day === i);
            days.push({
                day: i,
                total: stat ? stat.total : 0
            });
        }

        return days;
    }, [currentDate, dailyStats]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="w-full">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-zinc-400 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => item.day && onDayClick?.(item.day)}
                        className={`
                            aspect-square rounded-xl flex flex-col items-center justify-center relative border transition-all duration-200
                            ${!item.day
                                ? 'border-transparent bg-transparent pointer-events-none'
                                : 'cursor-pointer hover:shadow-md border-zinc-100 bg-white'
                            }
                            ${item.total > 0 ? 'bg-indigo-50/50 border-indigo-100' : ''}
                        `}
                    >
                        {item.day && (
                            <>
                                <span className={`text-sm font-medium ${item.total > 0 ? 'text-indigo-900' : 'text-zinc-600'}`}>
                                    {item.day}
                                </span>
                                {item.total > 0 && (
                                    <span className="text-[10px] font-bold text-indigo-600 mt-1">
                                        ₹{item.total >= 1000 ? (item.total / 1000).toFixed(1) + 'k' : item.total}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
