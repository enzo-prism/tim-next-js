import type { SearchAnalyticsApiRow } from "@/app/api/admin/gsc/overview/opportunities";

export const GSC_QUERY_PAGE_SIZE = 5_000;
// Bound upstream work and payload processing. The final request asks for one
// extra row so the response can state honestly when this cap truncated data.
export const GSC_QUERY_PAGE_ROW_CAP = 25_000;

export type QueryPageBatch = (
  startRow: number,
  rowLimit: number,
) => Promise<SearchAnalyticsApiRow[]>;

export const fetchBoundedQueryPageRows = async (
  fetchBatch: QueryPageBatch,
  rowCap = GSC_QUERY_PAGE_ROW_CAP,
  pageSize = GSC_QUERY_PAGE_SIZE,
) => {
  const rows: SearchAnalyticsApiRow[] = [];
  let truncated = false;

  while (rows.length < rowCap) {
    const remaining = rowCap - rows.length;
    const limit = remaining <= pageSize ? remaining + 1 : pageSize;
    const batch = await fetchBatch(rows.length, limit);

    if (batch.length > remaining) {
      rows.push(...batch.slice(0, remaining));
      truncated = true;
      break;
    }

    rows.push(...batch);
    if (batch.length < limit) break;
  }

  return {
    rows,
    truncated,
    rowsScanned: rows.length,
    rowCap,
  };
};
