import { describe, expect, it } from "vitest";

import {
  classifyDeploymentState,
  evaluateDeploymentList,
} from "./release-deployment-guard.mjs";

const deployment = ({
  sha = "release-sha",
  state = "READY",
  target = "production",
} = {}) => ({
  url: "release.example.vercel.app",
  state,
  target,
  meta: { githubCommitSha: sha },
});

const payload = (...deployments) => JSON.stringify({ deployments });

describe("release deployment guard", () => {
  it("accepts only a ready production deployment for the exact commit", () => {
    expect(evaluateDeploymentList(payload(deployment()), "release-sha")).toEqual({
      classification: "ready",
      state: "READY",
      url: "release.example.vercel.app",
    });
  });

  it.each(["BUILDING", "QUEUED", "INITIALIZING", "PENDING"])(
    "classifies %s as in progress",
    (state) => {
      expect(classifyDeploymentState(state)).toBe("in_progress");
    },
  );

  it.each(["ERROR", "CANCELED", "DELETED"])(
    "classifies %s as failed",
    (state) => {
      expect(classifyDeploymentState(state)).toBe("failed");
    },
  );

  it("ignores a deployment from another commit", () => {
    expect(
      evaluateDeploymentList(payload(deployment({ sha: "other-sha" })), "release-sha"),
    ).toBeNull();
  });

  it("ignores a preview deployment for the exact commit", () => {
    expect(
      evaluateDeploymentList(payload(deployment({ target: null })), "release-sha"),
    ).toBeNull();
  });

  it("fails closed when the deployment response cannot be parsed", () => {
    expect(() => evaluateDeploymentList("not-json", "release-sha")).toThrow(
      "Could not parse Vercel deployment list output.",
    );
  });
});
