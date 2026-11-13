import { describe, expect, it } from "vitest";
import { IDLE_WARNING, warningFor } from "./label-toy";

describe("Label Lens toy warning", () => {
  it("says nothing without a pick", () => {
    expect(warningFor(null)).toBe(IDLE_WARNING);
  });

  it("quotes the label word for word when the allergen is on it", () => {
    expect(warningFor("milk")).toBe("Warning for milk. The label says “milk powder”.");
  });

  it("refuses to warn when there is nothing to quote", () => {
    expect(warningFor("shellfish")).toBe("Nothing on this label to quote for shellfish, so no warning.");
  });
});
