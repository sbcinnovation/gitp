#!/usr/bin/env bun

import React, { useState, useEffect } from "react";
import { render, Box, Text, useInput, useApp } from "ink";
import { execSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const App = () => {
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(0);
  const [view, setView] = useState("branches"); // 'branches', 'commits', 'files'
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(0);
  const { exit } = useApp();

  useEffect(() => {
    loadBranches();
    loadCurrentBranch();
  }, []);

  const loadBranches = () => {
    try {
      const output = execSync("git branch -a", { encoding: "utf8" });
      const branchList = output
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.trim().replace(/^\*?\s*/, ""));
      setBranches(branchList);
    } catch (error) {
      console.error("Error loading branches:", error.message);
    }
  };

  const loadCurrentBranch = () => {
    try {
      const output = execSync("git branch --show-current", {
        encoding: "utf8",
      });
      setCurrentBranch(output.trim());
    } catch (error) {
      console.error("Error loading current branch:", error.message);
    }
  };

  const loadCommits = (branch) => {
    try {
      const output = execSync(`git log --oneline --max-count=50 ${branch}`, {
        encoding: "utf8",
      });
      const commitList = output
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.trim());
      setCommits(commitList);
      setSelectedCommit(0);
    } catch (error) {
      console.error("Error loading commits:", error.message);
    }
  };

  const loadFiles = (commit) => {
    try {
      const output = execSync(`git show --name-only ${commit.split(" ")[0]}`, {
        encoding: "utf8",
      });
      const fileList = output
        .split("\n")
        .filter(
          (line) =>
            line.trim() &&
            !line.startsWith("commit") &&
            !line.startsWith("Author") &&
            !line.startsWith("Date")
        )
        .map((line) => line.trim());
      setFiles(fileList);
      setSelectedFile(0);
    } catch (error) {
      console.error("Error loading files:", error.message);
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      if (view === "commits") {
        setView("branches");
        setSelectedIndex(0);
      } else if (view === "files") {
        setView("commits");
        setSelectedFile(0);
      } else {
        exit();
      }
      return;
    }

    if (key.return) {
      if (view === "branches") {
        const selectedBranch = branches[selectedIndex];
        if (selectedBranch) {
          loadCommits(selectedBranch);
          setView("commits");
        }
      } else if (view === "commits") {
        const selectedCommit = commits[selectedCommit];
        if (selectedCommit) {
          loadFiles(selectedCommit);
          setView("files");
        }
      } else if (view === "files") {
        const selectedFile = files[selectedFile];
        if (selectedFile) {
          try {
            const diff = execSync(
              `git show ${
                commits[selectedCommit].split(" ")[0]
              }:${selectedFile}`,
              { encoding: "utf8" }
            );
            console.log(`\n=== ${selectedFile} ===\n${diff}\n`);
          } catch (error) {
            console.error(`Error showing file: ${error.message}`);
          }
        }
      }
      return;
    }

    if (view === "branches") {
      if (key.upArrow) {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      } else if (key.downArrow) {
        setSelectedIndex(Math.min(branches.length - 1, selectedIndex + 1));
      }
    } else if (view === "commits") {
      if (key.upArrow) {
        setSelectedCommit(Math.max(0, selectedCommit - 1));
      } else if (key.downArrow) {
        setSelectedCommit(Math.min(commits.length - 1, selectedCommit + 1));
      }
    } else if (view === "files") {
      if (key.upArrow) {
        setSelectedFile(Math.max(0, selectedFile - 1));
      } else if (key.downArrow) {
        setSelectedFile(Math.min(files.length - 1, selectedFile + 1));
      }
    }
  });

  const renderBranches = () => (
    <Box flexDirection="column">
      <Text bold color="green">
        GITP - Git Branch Explorer
      </Text>
      <Text color="blue">Current Branch: {currentBranch}</Text>
      <Text color="yellow">
        Select a branch (↑↓ to navigate, Enter to select, Esc to exit):
      </Text>
      {branches.map((branch, index) => (
        <Text key={index} color={index === selectedIndex ? "green" : "white"}>
          {index === selectedIndex ? "▶ " : "  "}
          {branch}
        </Text>
      ))}
    </Box>
  );

  const renderCommits = () => (
    <Box flexDirection="column">
      <Text bold color="green">
        Commits in {branches[selectedIndex]}
      </Text>
      <Text color="yellow">
        Select a commit (↑↓ to navigate, Enter to select, Esc to go back):
      </Text>
      {commits.map((commit, index) => (
        <Text key={index} color={index === selectedCommit ? "green" : "white"}>
          {index === selectedCommit ? "▶ " : "  "}
          {commit}
        </Text>
      ))}
    </Box>
  );

  const renderFiles = () => (
    <Box flexDirection="column">
      <Text bold color="green">
        Files in commit: {commits[selectedCommit]}
      </Text>
      <Text color="yellow">
        Select a file (↑↓ to navigate, Enter to view, Esc to go back):
      </Text>
      {files.map((file, index) => (
        <Text key={index} color={index === selectedFile ? "green" : "white"}>
          {index === selectedFile ? "▶ " : "  "}
          {file}
        </Text>
      ))}
    </Box>
  );

  return (
    <Box flexDirection="column" padding={1}>
      {view === "branches" && renderBranches()}
      {view === "commits" && renderCommits()}
      {view === "files" && renderFiles()}
      <Box marginTop={1}>
        <Text color="gray">Press Esc to go back/exit</Text>
      </Box>
    </Box>
  );
};

render(<App />);
