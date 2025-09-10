#!/usr/bin/env bun

import { Command } from "commander";
import { existsSync, statSync } from "fs";
import { dirname, resolve } from "path";
import React from "react";
import { render } from "ink";
import App from "./internal/ui/app/App";

const program = new Command();
program
  .name("gitp")
  .description("Pretty git branch exploration for the terminal")
  .version("1.0.0");

program
  .command("browse", { isDefault: true })
  .description("Browse branches, commits, files and diffs")
  .argument("[path]", "Optional path to run in (like vim)")
  .action((maybePath?: string) => {
    try {
      if (maybePath) {
        const resolvedPath = resolve(maybePath);
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
          console.error(`Unable to stat path: ${resolvedPath}: ${e?.message ?? e}`);
          process.exitCode = 1;
          return;
        }

        try {
          process.chdir(directoryToUse);
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.error(
            `Failed to change directory to ${directoryToUse}: ${e?.message ?? e}`,
          );
          process.exitCode = 1;
          return;
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
