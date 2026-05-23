"use client";

import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  from: string;
  onChange: (range: { from: string; to: string }) => void;
  to: string;
};

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function parseDate(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function toInputDate(value: Date) {
  return format(value, "yyyy-MM-dd");
}

function toDisplayDate(value: string) {
  const date = parseDate(value);
  return date ? format(date, "dd-MM-yyyy") : "dd-mm-yyyy";
}

export function DateRangePicker({ from, onChange, to }: DateRangePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    startOfMonth(parseDate(from) ?? new Date()),
  );
  const [selectingStart, setSelectingStart] = useState(true);
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function pickDate(date: Date) {
    if (selectingStart || !fromDate) {
      onChange({ from: toInputDate(date), to: "" });
      setSelectingStart(false);
      return;
    }

    if (date < fromDate) {
      onChange({ from: toInputDate(date), to: toInputDate(fromDate) });
    } else {
      onChange({ from, to: toInputDate(date) });
    }

    setSelectingStart(true);
  }

  function setPreset(days: number) {
    const today = new Date();
    onChange({
      from: toInputDate(subDays(today, days - 1)),
      to: toInputDate(today),
    });
    setVisibleMonth(startOfMonth(today));
    setSelectingStart(true);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        className={cn(
          "flex h-10 w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 lg:w-80",
          open && "border-violet-500 ring-2 ring-violet-200",
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>
          {toDisplayDate(from)} ~ {toDisplayDate(to)}
        </span>
        <CalendarDays className="h-4 w-4 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-40 w-[min(calc(100vw-2rem),27rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="grid md:grid-cols-[7.5rem_1fr]">
            <div className="border-b border-slate-200 p-3 md:border-b-0 md:border-r">
              <p className="mb-3 text-center text-sm font-semibold leading-5 text-slate-900">
                Ngày release
              </p>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
                <PresetButton onClick={() => setPreset(7)}>7 ngày qua</PresetButton>
                <PresetButton onClick={() => setPreset(15)}>15 ngày qua</PresetButton>
                <PresetButton onClick={() => setPreset(30)}>30 ngày qua</PresetButton>
              </div>
            </div>

            <div>
              <div className="border-b border-slate-200 px-3 py-2 text-sm font-medium text-slate-900">
                {toDisplayDate(from)} ~ {toDisplayDate(to)}
              </div>
              <div className="p-3">
                <MonthCalendar
                  fromDate={fromDate}
                  month={visibleMonth}
                  onNext={() => setVisibleMonth(addMonths(visibleMonth, 1))}
                  onNextYear={() => setVisibleMonth(addYears(visibleMonth, 1))}
                  onPick={pickDate}
                  onPrevious={() => setVisibleMonth(subMonths(visibleMonth, 1))}
                  onPreviousYear={() => setVisibleMonth(subYears(visibleMonth, 1))}
                  toDate={toDate}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-200 p-3">
                <Button
                  onClick={() => {
                    onChange({ from: "", to: "" });
                    setSelectingStart(true);
                  }}
                  type="button"
                  variant="ghost"
                >
                  Xóa
                </Button>
                <Button onClick={() => setOpen(false)} size="sm" type="button">
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PresetButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-md px-2 py-2 text-center text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950 md:text-left"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function MonthCalendar({
  fromDate,
  month,
  onNext,
  onNextYear,
  onPick,
  onPrevious,
  onPreviousYear,
  toDate,
}: {
  fromDate: Date | null;
  month: Date;
  onNext: () => void;
  onNextYear: () => void;
  onPick: (date: Date) => void;
  onPrevious: () => void;
  onPreviousYear: () => void;
  toDate: Date | null;
}) {
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month],
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CalendarNavButton label="Năm trước" onClick={onPreviousYear}>
            «
          </CalendarNavButton>
          <CalendarNavButton label="Tháng trước" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </CalendarNavButton>
        </div>
        <p className="text-sm font-semibold text-slate-950">
          Th {format(month, "MM yyyy")}
        </p>
        <div className="flex items-center gap-1">
          <CalendarNavButton label="Tháng sau" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </CalendarNavButton>
          <CalendarNavButton label="Năm sau" onClick={onNextYear}>
            »
          </CalendarNavButton>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <div className="py-1 text-xs font-semibold text-slate-900" key={day}>
            {day}
          </div>
        ))}
        {days.map((day) => {
          const inCurrentMonth = isSameMonth(day, month);
          const isStart = fromDate ? isSameDay(day, fromDate) : false;
          const isEnd = toDate ? isSameDay(day, toDate) : false;
          const inRange =
            fromDate && toDate
              ? isWithinInterval(day, { start: fromDate, end: toDate })
              : false;

          return (
            <button
              className={cn(
                "h-8 rounded-md text-sm font-medium transition-colors hover:bg-violet-50",
                !inCurrentMonth && "text-slate-300",
                inRange && "bg-violet-50 text-violet-900",
                (isStart || isEnd) && "bg-violet-500 text-white hover:bg-violet-600",
              )}
              key={day.toISOString()}
              onClick={() => onPick(day)}
              type="button"
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarNavButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-900"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
