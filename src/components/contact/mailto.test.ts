import { describe, expect, it } from "vitest";
import { composeMailto, MAIL_SUBJECT } from "./mailto";

describe("composer mailto", () => {
  it("always carries the fixed subject", () => {
    expect(composeMailto("a@b.c", "")).toBe(`mailto:a@b.c?subject=${encodeURIComponent(MAIL_SUBJECT)}`);
    expect(MAIL_SUBJECT).toBe("Role for a data or AI engineer");
  });

  it("puts the note in the body, encoded so line breaks and symbols survive", () => {
    const url = composeMailto("a@b.c", "Hi Srujan,\nwe’re hiring & would like to talk?");
    const body = new URL(url).searchParams.get("body");
    expect(body).toBe("Hi Srujan,\nwe’re hiring & would like to talk?");
    expect(new URL(url).searchParams.get("subject")).toBe(MAIL_SUBJECT);
  });

  it("leaves the body out when the note is blank", () => {
    expect(composeMailto("a@b.c", "   \n ")).not.toContain("body=");
  });
});
