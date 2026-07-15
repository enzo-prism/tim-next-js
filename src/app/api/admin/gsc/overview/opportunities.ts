export const OPPORTUNITY_MIN_POSITION = 4;
export const OPPORTUNITY_MAX_POSITION = 20;
export const OPPORTUNITY_LIMIT = 25;

export type SearchAnalyticsApiRow = {
  keys?: string[] | null;
  clicks?: number | null;
  impressions?: number | null;
  ctr?: number | null;
  position?: number | null;
};

export type QueryPageRow = {
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchOpportunity = QueryPageRow & {
  opportunityScore: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export const mapQueryPageRows = (rows: SearchAnalyticsApiRow[] = []): QueryPageRow[] =>
  rows.map((row) => ({
    page: row.keys?.[0] ?? "",
    query: row.keys?.[1] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));

export const buildSearchOpportunityCandidates = (
  rows: QueryPageRow[],
): SearchOpportunity[] =>
  rows
    .filter(
      (row) =>
        row.page.length > 0 &&
        row.query.length > 0 &&
        row.impressions > 0 &&
        row.position >= OPPORTUNITY_MIN_POSITION &&
        row.position <= OPPORTUNITY_MAX_POSITION,
    )
    .map((row) => {
      // This is a prioritization score, not a traffic forecast. It rewards
      // impressions, proximity to page-one visibility, and room to improve CTR.
      const rankPotential =
        (OPPORTUNITY_MAX_POSITION + 1 - row.position) /
        (OPPORTUNITY_MAX_POSITION + 1 - OPPORTUNITY_MIN_POSITION);
      const ctrPotential = 1 - clamp(row.ctr, 0, 1);
      const opportunityScore = Number(
        (row.impressions * rankPotential * ctrPotential).toFixed(2),
      );

      return { ...row, opportunityScore };
    })
    .sort(
      (left, right) =>
        right.opportunityScore - left.opportunityScore ||
        right.impressions - left.impressions ||
        left.position - right.position,
    )
    .slice(0, OPPORTUNITY_LIMIT);
