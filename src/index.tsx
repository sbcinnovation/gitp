#!/usr/bin/env bun

import { Command } from "commander";
import React from "react";
import { render } from "ink";
import App from "./app/App";

const program = new Command();
program
  .name("gitp")
  .description("Pretty git branch exploration for the terminal")
  .version("1.0.0");

program
  .command("browse")
  .description("Browse branches, commits, files and diffs")
  .action(() => {
    render(<App />);
  });

program.parseAsync(process.argv);
