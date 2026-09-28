export const practiceTimeZone = "America/Los_Angeles";

export const practicePhone = {
  href: "tel:+14083588100",
  display: "(408) 358-8100",
} as const;

/**
 * Weekly opening hours in practice-local time. Weekdays use JavaScript
 * numbering (0 = Sunday). `structured-data.test.ts` keeps the LocalBusiness
 * `openingHoursSpecification` in sync with this list.
 */
export const practiceWeeklyHours = [
  { weekday: 1, opens: "09:00", closes: "17:00" },
  { weekday: 2, opens: "09:00", closes: "17:00" },
  { weekday: 3, opens: "09:00", closes: "17:00" },
  { weekday: 4, opens: "09:00", closes: "17:00" },
] as const;

export const practiceHoursSummary = "Mon–Thu, 9 AM–5 PM";

export type PracticeStatus =
  | { isOpen: true; closesAt: string }
  | { isOpen: false; opensAt: string; opensDay: string | null };

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const getPracticeClock = (now: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: practiceTimeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";

  return {
    weekday: weekdayLabels.indexOf(part("weekday") as (typeof weekdayLabels)[number]),
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
  };
};

/** Whether the office is open at `now`, and if not, when it next opens. */
export const getPracticeStatus = (now: Date): PracticeStatus => {
  const { weekday, minutes } = getPracticeClock(now);

  for (let offset = 0; offset < 8; offset += 1) {
    const day = (weekday + offset) % 7;
    const hours = practiceWeeklyHours.find((entry) => entry.weekday === day);
    if (!hours) continue;

    if (offset === 0) {
      if (minutes >= toMinutes(hours.opens) && minutes < toMinutes(hours.closes)) {
        return { isOpen: true, closesAt: formatTime(hours.closes) };
      }
      if (minutes < toMinutes(hours.opens)) {
        return { isOpen: false, opensAt: formatTime(hours.opens), opensDay: null };
      }
      continue;
    }

    return { isOpen: false, opensAt: formatTime(hours.opens), opensDay: weekdayLabels[day] };
  }

  throw new Error("practiceWeeklyHours has no open days");
};

/** Short status line, e.g. "Open now · until 5 PM" or "Closed · opens Mon 9 AM". */
export const describePracticeStatus = (status: PracticeStatus) => {
  if (status.isOpen) return `Open now · until ${status.closesAt}`;
  return status.opensDay
    ? `Closed · opens ${status.opensDay} ${status.opensAt}`
    : `Closed · opens ${status.opensAt}`;
};
