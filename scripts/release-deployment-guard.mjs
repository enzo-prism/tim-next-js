import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ACTIVE_STATES = new Set(["BUILDING", "QUEUED", "INITIALIZING", "PENDING"]);

export const classifyDeploymentState = (state) => {
  if (state === "READY") return "ready";
  if (ACTIVE_STATES.has(state)) return "in_progress";
  return "failed";
};

export const evaluateDeploymentList = (raw, commitSha) => {
  const jsonStart = raw.indexOf("{");
  if (jsonStart < 0) {
    throw new Error("Could not parse Vercel deployment list output.");
  }

  const parsed = JSON.parse(raw.slice(jsonStart));
  const matching = (parsed.deployments ?? []).find(
    (deployment) =>
      deployment.target === "production" &&
      deployment.meta?.githubCommitSha === commitSha,
  );

  if (!matching) return null;
  return {
    classification: classifyDeploymentState(matching.state),
    state: matching.state,
    url: matching.url,
  };
};

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  try {
    const result = evaluateDeploymentList(
      fs.readFileSync(process.argv[2], "utf8"),
      process.argv[3],
    );
    if (result) {
      process.stdout.write(
        `${result.classification}\t${result.state}\t${result.url}`,
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
