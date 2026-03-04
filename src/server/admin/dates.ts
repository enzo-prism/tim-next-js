const ALLOWED_DAYS = new Set([7, 30, 90]);

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export type AdminDateRange = {
  days: 7 | 30 | 90;
  startDate: string;
  endDate: string;
};

export const getAdminDateRange = (daysParam: string | null): AdminDateRange => {
  const parsed = daysParam ? Number.parseInt(daysParam, 10) : Number.NaN;
  const days = (ALLOWED_DAYS.has(parsed) ? parsed : 30) as AdminDateRange["days"];

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const end = new Date(todayUtc);
  end.setUTCDate(end.getUTCDate() - 1);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  return {
    days,
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
};
