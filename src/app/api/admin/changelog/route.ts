import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const changelogCache: {
  expiresAt: number;
  payload: unknown | null;
} = {
  expiresAt: 0,
  payload: null,
};

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

const resolvePublicDir = () => {
  const candidates = [
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "dist", "public"),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // Ignore
    }
  }

  return candidates[0];
};

export async function GET() {
  const now = Date.now();
  if (changelogCache.payload && changelogCache.expiresAt > now) {
    return jsonResponse(changelogCache.payload);
  }

  const publicDir = resolvePublicDir();
  const changelogPath = path.join(publicDir, "admin-changelog.json");

  if (!fs.existsSync(changelogPath)) {
    try {
      const logOutput = execFileSync(
        "git",
        [
          "log",
          "-n",
          "50",
          "--no-merges",
          "--date=short",
          "--pretty=format:%H\t%ad\t%s",
        ],
        {
          cwd: process.cwd(),
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        },
      );

      let repoUrl: string | null = null;
      try {
        const remote = execFileSync("git", ["config", "--get", "remote.origin.url"], {
          cwd: process.cwd(),
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();

        const trimmed = remote.trim().replace(/\.git$/, "");
        const httpsMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/i);
        if (httpsMatch) {
          const [, owner, repo] = httpsMatch;
          repoUrl = `https://github.com/${owner}/${repo}`;
        } else {
          const sshMatch =
            trimmed.match(/^git@github\.com:([^/]+)\/([^/]+)$/i) ||
            trimmed.match(/^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+)$/i);
          if (sshMatch) {
            const [, owner, repo] = sshMatch;
            repoUrl = `https://github.com/${owner}/${repo}`;
          }
        }
      } catch {
        // ignore
      }

      const entries = logOutput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [hash, date, ...subjectParts] = line.split("\t");
          const subject = subjectParts.join("\t").trim();
          return {
            hash,
            shortHash: hash.slice(0, 7),
            date,
            subject,
            url: repoUrl ? `${repoUrl}/commit/${hash}` : null,
          };
        });

      const payload = {
        generatedAt: new Date().toISOString(),
        entries,
      };

      changelogCache.payload = payload;
      changelogCache.expiresAt = now + 60_000;
      return jsonResponse(payload);
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "missing_changelog",
          message: "Changelog not generated. Run `npm run build`.",
        },
        { status: 503 },
      );
    }
  }

  try {
    const text = fs.readFileSync(changelogPath, "utf8");
    const payload = JSON.parse(text) as unknown;
    changelogCache.payload = payload;
    changelogCache.expiresAt = now + 60_000;
    return jsonResponse(payload);
  } catch (error) {
    console.error("Failed to read admin changelog:", error);
    return jsonResponse(
      {
        ok: false,
        error: "server_error",
        message: "Failed to load changelog.",
      },
      { status: 500 },
    );
  }
}
