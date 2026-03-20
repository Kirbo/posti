import { describe, expect, it } from "vitest";
import { formatDuration } from "../../src/utils/time.js";

describe("formatDuration", () => {
  it("should format milliseconds only", () => {
    expect(formatDuration(500)).toBe("0.500s");
  });

  it("should format seconds", () => {
    expect(formatDuration(5000)).toBe("5.000s");
  });

  it("should format minutes and seconds", () => {
    expect(formatDuration(90_000)).toBe("1m 30.000s");
  });

  it("should format hours, minutes and seconds", () => {
    expect(formatDuration(3_661_000)).toBe("1h 1m 1.000s");
  });

  it("should handle zero", () => {
    expect(formatDuration(0)).toBe("0.000s");
  });
});
