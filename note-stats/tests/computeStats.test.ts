import { computeStats } from "../src/index";

describe("computeStats()", () => {
  it("returns zeros for empty string", () => {
    const stats = computeStats("");
    expect(stats).toEqual({
      words: 0,
      chars: 0,
      charsNoSpaces: 0,
      lines: 1,
      paragraphs: 0,
    });
  });

  it("counts words, chars, lines, paragraphs correctly", () => {
    const text = `Hello world
This is a test.

New paragraph here.
`;
    const stats = computeStats(text);
    expect(stats.words).toBe(9);
    expect(stats.chars).toBe(text.length);
    expect(stats.charsNoSpaces).toBe(text.replace(/\s/g, "").length);
    expect(stats.lines).toBe(5);
    expect(stats.paragraphs).toBe(2);
  });
});
