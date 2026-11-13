import { describe, expect, test } from "vitest";
import { parseCitedAnswer } from "./citations";

const allowed = new Set(["project-surplus-station", "project-label-lens", "role-associate-celebal"]);

describe("parseCitedAnswer", () => {
  test("keeps sentences with valid citations and strips the markers from the text", () => {
    const out = parseCitedAnswer("Surplus Station runs offline on four Mac minis [project-surplus-station]. Label Lens quotes the label word for word [project-label-lens].", allowed);
    expect(out).toEqual([
      { text: "Surplus Station runs offline on four Mac minis.", citations: ["project-surplus-station"] },
      { text: "Label Lens quotes the label word for word.", citations: ["project-label-lens"] },
    ]);
  });

  test("accepts citations placed after the full stop", () => {
    expect(parseCitedAnswer("He ran a 10 million records a day pipeline. [role-associate-celebal]", allowed)).toEqual([
      { text: "He ran a 10 million records a day pipeline.", citations: ["role-associate-celebal"] },
    ]);
  });

  test("drops sentences with no citation at all", () => {
    expect(parseCitedAnswer("He is the best engineer alive. Surplus Station is in production [project-surplus-station].", allowed)).toEqual([
      { text: "Surplus Station is in production.", citations: ["project-surplus-station"] },
    ]);
  });

  test("drops citations outside the retrieved set, and the sentence if none remain", () => {
    expect(parseCitedAnswer("He won a Turing Award [event-turing]. Label Lens is live [project-label-lens] [project-made-up].", allowed)).toEqual([
      { text: "Label Lens is live.", citations: ["project-label-lens"] },
    ]);
  });

  test("dedupes repeated citations and handles multiple per sentence", () => {
    expect(parseCitedAnswer("Both ground their output [project-surplus-station][project-label-lens][project-surplus-station].", allowed)[0].citations).toEqual(["project-surplus-station", "project-label-lens"]);
  });

  test("decimals and abbreviations do not split a sentence", () => {
    expect(parseCitedAnswer("My capstone reached 27.7% WAPE vs. a 38.5% naive baseline [project-surplus-station]. My GPA is 3.96 [project-label-lens].", allowed)).toEqual([
      { text: "My capstone reached 27.7% WAPE vs. a 38.5% naive baseline.", citations: ["project-surplus-station"] },
      { text: "My GPA is 3.96.", citations: ["project-label-lens"] },
    ]);
  });

  test("returns nothing for an empty or uncited answer", () => {
    expect(parseCitedAnswer("", allowed)).toEqual([]);
    expect(parseCitedAnswer("Not in my portfolio.", allowed)).toEqual([]);
  });

  test("never lets markup through: brackets that are not ids stay as plain text and still need a citation", () => {
    expect(parseCitedAnswer("<img src=x onerror=alert(1)> [project-surplus-station].", allowed)).toEqual([
      { text: "<img src=x onerror=alert(1)>.", citations: ["project-surplus-station"] },
    ]);
  });
});
