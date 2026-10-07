import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  SEASON_ATTRIBUTE,
  SEASON_OPT_OUT_KEY,
  SEASON_PREVIEW_KEY,
  activeSeason,
  buildSeasonScript,
  halloween2026,
  isSeasonInRange,
  isSeasonQuietRoute,
} from "./seasonal";

// Pacific Daylight Time is UTC-7 throughout October 2026.
const SEP_30_LAST_MINUTE = "2026-10-01T06:59:00Z";
const OCT_1_MIDNIGHT = "2026-10-01T07:00:00Z";
const OCT_31_LAST_MINUTE = "2026-11-01T06:59:00Z";
const NOV_1_MIDNIGHT = "2026-11-01T07:00:00Z";

describe("isSeasonInRange", () => {
  it("follows the practice's Pacific calendar day, not UTC", () => {
    expect(isSeasonInRange(halloween2026, new Date(SEP_30_LAST_MINUTE))).toBe(false);
    expect(isSeasonInRange(halloween2026, new Date(OCT_1_MIDNIGHT))).toBe(true);
    expect(isSeasonInRange(halloween2026, new Date(OCT_31_LAST_MINUTE))).toBe(true);
    expect(isSeasonInRange(halloween2026, new Date(NOV_1_MIDNIGHT))).toBe(false);
  });
});

type Store = Map<string, string> | "throws";

function storageArea(store: Map<string, string>) {
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
}

/** Runs the real inline script against a fake browser. */
function runScript({
  now,
  search = "",
  local = new Map<string, string>(),
  session = new Map<string, string>(),
}: {
  now: string;
  search?: string;
  local?: Store;
  session?: Store;
}) {
  const attributes = new Map<string, string>();
  const fixed = new Date(now).getTime();
  class FixedDate extends Date {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(fixed);
      else super(...(args as [string]));
    }
  }
  const window: Record<string, unknown> = { location: { search, pathname: "/" } };
  for (const [name, store] of [
    ["localStorage", local],
    ["sessionStorage", session],
  ] as const) {
    Object.defineProperty(window, name, {
      get() {
        if (store === "throws") throw new Error("SecurityError: storage is blocked");
        return storageArea(store);
      },
    });
  }
  const document = {
    documentElement: {
      setAttribute: (name: string, value: string) => void attributes.set(name, value),
    },
  };

  runInNewContext(buildSeasonScript(halloween2026), {
    window,
    document,
    Date: FixedDate,
    Intl,
    URLSearchParams,
  });

  return attributes.get(SEASON_ATTRIBUTE) ?? null;
}

describe("buildSeasonScript", () => {
  it("turns the season on only inside the date range", () => {
    expect(runScript({ now: SEP_30_LAST_MINUTE })).toBeNull();
    expect(runScript({ now: OCT_1_MIDNIGHT })).toBe("halloween");
    expect(runScript({ now: OCT_31_LAST_MINUTE })).toBe("halloween");
    expect(runScript({ now: NOV_1_MIDNIGHT })).toBeNull();
  });

  it("previews out of season with ?season=halloween for the rest of the session", () => {
    const session = new Map<string, string>();
    expect(runScript({ now: NOV_1_MIDNIGHT, search: "?season=halloween", session })).toBe("halloween");
    expect(session.get(SEASON_PREVIEW_KEY)).toBe("1");
    expect(runScript({ now: NOV_1_MIDNIGHT, session })).toBe("halloween");
  });

  it("opts a browser out with ?season=off and resets with ?season=auto", () => {
    const local = new Map<string, string>();
    expect(runScript({ now: OCT_1_MIDNIGHT, search: "?season=off", local })).toBeNull();
    expect(local.get(SEASON_OPT_OUT_KEY)).toBe("off");
    expect(runScript({ now: OCT_1_MIDNIGHT, local })).toBeNull();
    expect(runScript({ now: OCT_1_MIDNIGHT, search: "?season=auto", local })).toBe("halloween");
    expect(local.has(SEASON_OPT_OUT_KEY)).toBe(false);
  });

  it("an explicit ?season=off wins over an active preview", () => {
    const session = new Map([[SEASON_PREVIEW_KEY, "1"]]);
    expect(runScript({ now: OCT_1_MIDNIGHT, search: "?season=off", session })).toBeNull();
    expect(session.has(SEASON_PREVIEW_KEY)).toBe(false);
  });

  it("still follows the calendar (and honors ?season=) when storage is blocked", () => {
    expect(runScript({ now: OCT_1_MIDNIGHT, local: "throws", session: "throws" })).toBe("halloween");
    expect(runScript({ now: NOV_1_MIDNIGHT, local: "throws", session: "throws" })).toBeNull();
    expect(
      runScript({ now: NOV_1_MIDNIGHT, search: "?season=halloween", local: "throws", session: "throws" }),
    ).toBe("halloween");
  });

  it("escapes markup in the inlined config", () => {
    expect(buildSeasonScript(halloween2026)).not.toMatch(/<\/?script/i);
  });
});

describe("seasonal layer boundaries", () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

  it("ships the seasonal favicon", () => {
    expect(activeSeason).not.toBeNull();
    expect(activeSeason!.startsOn <= activeSeason!.endsOn).toBe(true);
    expect(existsSync(join(process.cwd(), "public", activeSeason!.icon))).toBe(true);
  });

  it("keeps the pumpkin patch off forms, urgent care, and privacy pages", () => {
    for (const route of ["/book-appointment", "/book-appointment/", "/contact", "/urgent-dental-care", "/privacy-policy"]) {
      expect(isSeasonQuietRoute(route), route).toBe(true);
    }
    for (const route of ["/", "/services/children-dentistry", "/team", "/blog", null]) {
      expect(isSeasonQuietRoute(route), String(route)).toBe(false);
    }
  });

  it("leaves calls to action, forms, and the mobile action bar undecorated", () => {
    for (const path of [
      "src/components/layout/header.tsx",
      "src/components/layout/mobile-action-bar.tsx",
      "src/legacy-pages/book-appointment.tsx",
      "src/legacy-pages/contact.tsx",
      "src/components/tracking/tracked-links.tsx",
    ]) {
      expect(read(path), path).not.toMatch(/seasonal|ffsc-season/);
    }
  });
});
