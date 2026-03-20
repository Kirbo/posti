import { describe, expect, it } from "vitest";
import { sliceIntoChunks } from "../../src/utils/chunks.js";

describe("sliceIntoChunks", () => {
  it("should split array into chunks of specified size", () => {
    const input = [1, 2, 3, 4, 5, 6, 7];
    const result = sliceIntoChunks(input, 3);
    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it("should return single chunk when size >= array length", () => {
    const input = [1, 2, 3];
    const result = sliceIntoChunks(input, 5);
    expect(result).toEqual([[1, 2, 3]]);
  });

  it("should return empty array for empty input", () => {
    const result = sliceIntoChunks([], 3);
    expect(result).toEqual([]);
  });

  it("should handle chunk size of 1", () => {
    const input = [1, 2, 3];
    const result = sliceIntoChunks(input, 1);
    expect(result).toEqual([[1], [2], [3]]);
  });

  it("should NOT mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    sliceIntoChunks(input, 2);
    expect(input).toEqual(copy);
  });

  it("should throw on non-positive chunk size", () => {
    expect(() => sliceIntoChunks([1, 2, 3], 0)).toThrow();
    expect(() => sliceIntoChunks([1, 2, 3], -1)).toThrow();
  });
});
