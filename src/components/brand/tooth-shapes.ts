/*
 * Vector tooth-person traced from the Family First Smile Care logo.
 * Body spans x 0–100, y 0–119 (crown at the top, two roots at the bottom);
 * the head is a circle floating above the crown dip.
 */
export const TOOTH_BODY_PATH =
  "M50 6.2C42 3 32 0 21.6 0C8 0 0 10 0 30.5C0 52 12 88 24 112C27 118 36 121 38 112C40.5 100 43 83 50 83C57 83 59.5 100 62 112C64 121 73 118 76 112C88 88 100 52 100 30.5C100 10 92 0 78.4 0C68 0 58 3 50 6.2Z";

export const TOOTH_HEAD = { cx: 50, cy: -17.3, r: 17.6 } as const;

/** Logo order: periwinkle (head up), blush (right), lime (down), cloud (left). */
export const BRAND_TOOTH_COLORS = [
  "var(--ff-periwinkle)",
  "var(--ff-blush)",
  "var(--ff-lime)",
  "var(--ff-cloud)",
] as const;
