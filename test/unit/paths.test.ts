import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCacheDir, getConfigDir, getStateDir } from "../../src/config/paths.js";

describe("XDG Base Directory paths", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.XDG_CONFIG_HOME;
    delete process.env.XDG_CACHE_HOME;
    delete process.env.XDG_STATE_HOME;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getConfigDir", () => {
    it("should use XDG_CONFIG_HOME when set", () => {
      process.env.XDG_CONFIG_HOME = "/custom/config";
      expect(getConfigDir()).toBe("/custom/config/posti");
    });

    it("should fall back to ~/.config/posti when XDG_CONFIG_HOME is not set", () => {
      expect(getConfigDir()).toBe(path.join(os.homedir(), ".config", "posti"));
    });
  });

  describe("getCacheDir", () => {
    it("should use XDG_CACHE_HOME when set", () => {
      process.env.XDG_CACHE_HOME = "/custom/cache";
      expect(getCacheDir()).toBe("/custom/cache/posti");
    });

    it("should fall back to ~/.cache/posti when XDG_CACHE_HOME is not set", () => {
      expect(getCacheDir()).toBe(path.join(os.homedir(), ".cache", "posti"));
    });
  });

  describe("getStateDir", () => {
    it("should use XDG_STATE_HOME when set", () => {
      process.env.XDG_STATE_HOME = "/custom/state";
      expect(getStateDir()).toBe("/custom/state/posti");
    });

    it("should fall back to ~/.local/state/posti when XDG_STATE_HOME is not set", () => {
      expect(getStateDir()).toBe(path.join(os.homedir(), ".local", "state", "posti"));
    });
  });
});
