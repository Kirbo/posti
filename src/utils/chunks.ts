export function sliceIntoChunks<T>(array: T[], size: number): T[][] {
  if (size <= 0) throw new Error("Chunk size must be a positive number");
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
