import cliProgress from "cli-progress";
import pc from "picocolors";

export interface ProgressReporter {
  startOverall(totalFiles: number): void;
  startFile(filename: string): void;
  updateFileStep(step: string): void;
  updateFileProgress(step: string, current: number, total: number): void;
  completeFile(): void;
  stop(): void;
}

interface ProgressOptions {
  silent?: boolean;
}

export function createProgress(options: ProgressOptions = {}): ProgressReporter {
  if (options.silent) {
    return createSilentProgress();
  }
  return createMultiBarProgress();
}

function createSilentProgress(): ProgressReporter {
  return {
    startOverall() {},
    startFile() {},
    updateFileStep() {},
    updateFileProgress() {},
    completeFile() {},
    stop() {},
  };
}

function createMultiBarProgress(): ProgressReporter {
  const multi = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: "{label} {bar} {value}/{total} {suffix}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
    },
    cliProgress.Presets.shades_grey,
  );

  let overallBar: cliProgress.SingleBar | undefined;
  let fileBar: cliProgress.SingleBar | undefined;
  let filesCompleted = 0;

  return {
    startOverall(totalFiles: number) {
      filesCompleted = 0;
      overallBar = multi.create(totalFiles, 0, {
        label: pc.blue("files  "),
        suffix: "files",
      });
    },

    startFile(filename: string) {
      if (fileBar) {
        multi.remove(fileBar);
      }
      fileBar = multi.create(100, 0, {
        label: pc.cyan(filename.padEnd(7)),
        suffix: "Starting...",
      });
    },

    updateFileStep(step: string) {
      fileBar?.update(0, { suffix: `${step}...`, total: 100 });
    },

    updateFileProgress(step: string, current: number, total: number) {
      if (fileBar) {
        fileBar.setTotal(total);
        fileBar.update(current, { suffix: `${step} (${current}/${total})` });
      }
    },

    completeFile() {
      filesCompleted++;
      if (fileBar) {
        fileBar.update(fileBar.getTotal(), { suffix: pc.green("Done") });
      }
      overallBar?.update(filesCompleted);
    },

    stop() {
      multi.stop();
    },
  };
}
