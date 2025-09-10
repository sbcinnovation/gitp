#!/usr/bin/env bun

import { Command } from "commander";
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
  .argument("[path]", "Path to the repository", ".")
  .action((path) => {
    render(<App repoPath={path} />);
  });

program.parseAsync(process.argv);
