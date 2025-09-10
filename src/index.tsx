#!/usr/bin/env bun

import { Command } from "commander";
import { existsSync, statSync } from "fs";
import { dirname, resolve, join } from "path";
import React from "react";
import { render } from "ink";
import App from "./internal/ui/app/App";
import { execSync } from "child_process";

// Version metadata
const CURRENT_VERSION = "1.0.0";
const REPO_SLUG = "sbcinnovation/gitp";

const stripLeadingV = (version: string): string => version.replace(/^v/i, "");

const compareSemver = (a: string, b: string): number => {
  const [aMaj, aMin, aPatch] = stripLeadingV(a)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const [bMaj, bMin, bPatch] = stripLeadingV(b)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPatch - bPatch;
};

const program = new Command();
program
  .name("gitp")
  .description("Pretty git branch exploration for the terminal")
  .version(CURRENT_VERSION);

program
  .command("version")
  .description("Show gitp version information")
  .option("--check", "Check for the latest release on GitHub")
  .action(async (opts: { check?: boolean }) => {
    if (!opts?.check) {
      // Print only the current version to stdout
      // Keep output minimal for scripting
      // eslint-disable-next-line no-console
      console.log(CURRENT_VERSION);
      return;
    }
    try {
      const url = `https://api.github.com/repos/${REPO_SLUG}/releases/latest`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "gitp",
          Accept: "application/vnd.github+json",
        },
      } as any);
      if (!res.ok) {
        if (res.status === 404) {
          // No releases yet
          // eslint-disable-next-line no-console
          console.log(`Current version: ${CURRENT_VERSION}`);
          // eslint-disable-next-line no-console
          console.log(
            "No releases found yet. Visit https://github.com/sbcinnovation/gitp/releases"
          );
          return;
        }
        // eslint-disable-next-line no-console
        console.error(
          `Failed to check latest release (HTTP ${res.status}). Try again later.`
        );
        process.exitCode = 1;
        return;
      }
      const data: any = await res.json();
      const latestTag: string = String(data?.tag_name ?? data?.name ?? "");
      const latest = stripLeadingV(latestTag.trim());
      if (!latest) {
        // eslint-disable-next-line no-console
        console.log(`Current version: ${CURRENT_VERSION}`);
        // eslint-disable-next-line no-console
        console.log(
          "Unable to determine the latest release. Visit https://github.com/sbcinnovation/gitp/releases"
        );
        return;
      }
      const cmp = compareSemver(latest, CURRENT_VERSION);
      if (cmp > 0) {
        // eslint-disable-next-line no-console
        console.log(
          `New version available: ${latest} (current ${CURRENT_VERSION}).\nDownload: https://github.com/sbcinnovation/gitp/releases/latest`
        );
      } else if (cmp === 0) {
        // eslint-disable-next-line no-console
        console.log(`You are up to date (${CURRENT_VERSION}).`);
      } else {
        // eslint-disable-next-line no-console
        console.log(
          `You are ahead (${CURRENT_VERSION}). Latest stable is ${latest}.`
        );
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(`Version check failed: ${e?.message ?? e}`);
      process.exitCode = 1;
    }
  });

program
  .command("browse", { isDefault: true })
  .description("Browse branches, commits, files and diffs")
  .argument("[path]", "Optional path to run in (like vim)")
  .action((maybePath?: string) => {
    try {
      const userArgs = process.argv.slice(2);
      const isSuspiciousPhantomArg = (arg?: string): boolean => {
        if (!arg) return false;
        const lower = String(arg).toLowerCase();
        return lower === program.name().toLowerCase() || lower === "browse";
      };

      const noRealPathProvided =
        !maybePath ||
        maybePath.trim() === "" ||
        (isSuspiciousPhantomArg(maybePath) && userArgs.length <= 1);

      if (!noRealPathProvided) {
        const resolvedPath = resolve(maybePath!);
        if (!existsSync(resolvedPath)) {
          // eslint-disable-next-line no-console
          console.error(`Path not found: ${maybePath}`);
          process.exitCode = 1;
          return;
        }
        let directoryToUse = resolvedPath;
        try {
          const stats = statSync(resolvedPath);
          if (!stats.isDirectory()) {
            directoryToUse = dirname(resolvedPath);
          }
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.error(
            `Unable to stat path: ${resolvedPath}: ${e?.message ?? e}`
          );
          process.exitCode = 1;
          return;
        }

        try {
          process.chdir(directoryToUse);
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.error(
            `Failed to change directory to ${directoryToUse}: ${
              e?.message ?? e
            }`
          );
          process.exitCode = 1;
          return;
        }
      }

      // Try to auto-detect git worktree root and chdir there (helps Windows shims)
      const findGitWorkTreeRoot = (startDir: string): string | null => {
        try {
          let dir = startDir;
          // Walk up until filesystem root
          // Stop when ".git" exists (directory or file)
          // If not found, return null
          for (;;) {
            const marker = join(dir, ".git");
            if (existsSync(marker)) return dir;
            const parent = dirname(dir);
            if (!parent || parent === dir) break;
            dir = parent;
          }
          return null;
        } catch {
          return null;
        }
      };
      const worktreeRoot = findGitWorkTreeRoot(process.cwd());
      if (worktreeRoot && worktreeRoot !== process.cwd()) {
        try {
          process.chdir(worktreeRoot);
        } catch {
          // ignore; we will still try to run and let git report errors
        }
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(`Error handling path argument: ${e?.message ?? e}`);
      process.exitCode = 1;
      return;
    }

    render(<App />);
  });

program.parseAsync(process.argv);
