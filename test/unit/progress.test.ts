import { describe, expect, it } from "vitest";
import { createProgress, type ProgressReporter } from "../../src/utils/progress.js";

describe("createProgress", () => {
  it("should create a progress reporter", () => {
    const progress = createProgress({ silent: true });
    expect(progress).toBeDefined();
    expect(progress.startOverall).toBeTypeOf("function");
    expect(progress.startFile).toBeTypeOf("function");
    expect(progress.updateFileStep).toBeTypeOf("function");
    expect(progress.updateFileProgress).toBeTypeOf("function");
    expect(progress.completeFile).toBeTypeOf("function");
    expect(progress.stop).toBeTypeOf("function");
  });

  it("should track overall file progress in silent mode", () => {
    const progress = createProgress({ silent: true });
    progress.startOverall(3);
    progress.startFile("BAF_20250315.zip");
    progress.completeFile();
    progress.startFile("PCF_20250315.zip");
    progress.completeFile();
    progress.stop();
  });

  it("should track file steps in silent mode", () => {
    const progress = createProgress({ silent: true });
    progress.startOverall(1);
    progress.startFile("BAF_20250315.zip");
    progress.updateFileStep("Downloading");
    progress.updateFileStep("Extracting");
    progress.updateFileStep("Converting");
    progress.updateFileStep("Parsing");
    progress.updateFileProgress("Loading", 0, 5000);
    progress.updateFileProgress("Loading", 1000, 5000);
    progress.updateFileProgress("Loading", 5000, 5000);
    progress.completeFile();
    progress.stop();
  });

  it("should satisfy ProgressReporter interface", () => {
    const reporter: ProgressReporter = createProgress({ silent: true });
    expect(reporter).toBeDefined();
  });
});
