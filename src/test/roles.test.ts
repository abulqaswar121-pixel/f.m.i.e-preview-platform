import { describe, expect, it } from "vitest";

import { primaryRole } from "@/lib/roles";

describe("Account roles", () => {
  it("gives administrator access only when the saved roles include administrator", () => {
    expect(primaryRole(["registered_user", "administrator"])).toBe("administrator");
    expect(primaryRole(["registered_user", "survey_creator"])).toBe("survey_creator");
  });

  it("treats a member with no saved role as a basic registered member", () => {
    expect(primaryRole([])).toBe("registered_user");
    expect(primaryRole(["not_a_role"])).toBe("registered_user");
  });
});
