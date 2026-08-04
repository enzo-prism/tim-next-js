import { describe, expect, it } from "vitest";
import { DatabaseStorage } from "@/server/storage";

describe("Neon HTTP adapter contract", () => {
  it("createContactWithOutbox does not call .transaction()", () => {
    const source = DatabaseStorage.prototype.createContactWithOutbox.toString();
    expect(source).not.toContain(".transaction(");
    expect(source).not.toContain("transaction(async");
  });

  it("createContactWithOutbox uses a single execute() call (Neon HTTP compatible)", () => {
    const source = DatabaseStorage.prototype.createContactWithOutbox.toString();
    expect(source).toContain("execute(");
    expect(source).toContain("WITH inserted_contact");
  });
});
