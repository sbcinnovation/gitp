#!/usr/bin/env bun

import React, { useState, useEffect } from "react";
import { render, Box, Text, useInput, useApp } from "ink";
import { execSync } from "child_process";
import { exec } from "child_process";

const App = () => {
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [commits, setCommits] = useState<string[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<number>(0);
  const [view, setView] = useState<
    "branches" | "commits" | "files" | "diff" | "file"
  >("branches");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const [commitMetadata, setCommitMetadata] = useState<any>(null);
  const [diffContent, setDiffContent] = useState<string>("");
  const [diffScrollOffset, setDiffScrollOffset] = useState<number>(0);
  const [visualMode, setVisualMode] = useState<"none" | "character" | "line">(
    "none"
  );
  const [visualStart, setVisualStart] = useState<number>(0);
  const [visualEnd, setVisualEnd] = useState<number>(0);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileScrollOffset, setFileScrollOffset] = useState<number>(0);
  const [fileCursor, setFileCursor] = useState<number>(0);
  const [currentFilePath, setCurrentFilePath] = useState<string>("");
  const [terminalWidth, setTerminalWidth] = useState<number>(
    typeof process !== "undefined" && process.stdout && process.stdout.columns
      ? process.stdout.columns
      : 80
  );
  const { exit } = useApp();

  useEffect(() => {
    loadBranches();
    loadCurrentBranch();
  }, []);

  // Track terminal size to support dynamic layout
  useEffect(() => {
    const handleResize = () => {
      try {
        setTerminalWidth(process.stdout?.columns || 80);
      } catch {
        setTerminalWidth(80);
      }
    };
    if (process && (process.stdout as any)?.on) {
      (process.stdout as any).on("resize", handleResize);
    }
    return () => {
      if (process && (process.stdout as any)?.off) {
        (process.stdout as any).off("resize", handleResize);
      } else if (process && (process.stdout as any)?.removeListener) {
        (process.stdout as any).removeListener("resize", handleResize);
      }
    };
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

  const loadCommitMetadata = (commitHash) => {
    try {
      const output = execSync(`git show --format=fuller ${commitHash}`, {
        encoding: "utf8",
      });
      const lines = output.split("\n");
      const metadata = {
        hash: commitHash,
        author: "",
        authorDate: "",
        committer: "",
        commitDate: "",
        message: "",
        subject: "",
      };

      let inMessage = false;
      let messageLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith("commit ")) {
          metadata.hash = line.split(" ")[1];
        } else if (line.startsWith("Author: ")) {
          metadata.author = line.replace("Author: ", "");
        } else if (line.startsWith("AuthorDate: ")) {
          metadata.authorDate = line.replace("AuthorDate: ", "");
        } else if (line.startsWith("Commit: ")) {
          metadata.committer = line.replace("Commit: ", "");
        } else if (line.startsWith("CommitDate: ")) {
          metadata.commitDate = line.replace("CommitDate: ", "");
        } else if (line.startsWith("    ") && !inMessage) {
          inMessage = true;
          metadata.subject = line.trim();
          messageLines.push(line.trim());
        } else if (
          inMessage &&
          (line.startsWith("    ") || line.trim() === "")
        ) {
          messageLines.push(line.trim());
        } else if (inMessage && !line.startsWith("    ")) {
          break;
        }
      }

      metadata.message = messageLines.join("\n");
      setCommitMetadata(metadata);
    } catch (error) {
      console.error("Error loading commit metadata:", error.message);
    }
  };

  const loadDiff = (commitHash: string, filePath?: string) => {
    try {
      const fileArg = filePath ? ` -- "${filePath}"` : "";
      const output = execSync(
        `git show --stat --patch ${commitHash}${fileArg}`,
        {
          encoding: "utf8",
        }
      );
      setDiffContent(output);
      setDiffScrollOffset(0);
    } catch (error) {
      console.error("Error loading diff:", error.message);
    }
  };

  const loadFileAtCommit = (commitHash: string, filePath: string) => {
    try {
      // Use --textconv to respect Git attributes and decode binary-as-text if configured
      const output = execSync(`git show --textconv ${commitHash}:${filePath}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      setFileContent(output);
      setFileScrollOffset(0);
      setFileCursor(0);
      setCurrentFilePath(filePath);
    } catch (error) {
      setFileContent(
        `Unable to display this file at the selected commit. It may be binary or unavailable.\n\nDetails: ${error.message}`
      );
      setFileScrollOffset(0);
      setFileCursor(0);
      setCurrentFilePath(filePath);
    }
  };

  const copyToClipboard = (text: string) => {
    const platform = process.platform;
    let command: string;

    if (platform === "darwin") {
      command = `echo "${text.replace(/"/g, '\\"')}" | pbcopy`;
    } else if (platform === "linux") {
      command = `echo "${text.replace(
        /"/g,
        '\\"'
      )}" | xclip -selection clipboard`;
    } else if (platform === "win32") {
      command = `echo "${text.replace(/"/g, '\\"')}" | clip`;
    } else {
      console.log("Clipboard not supported on this platform");
      return;
    }

    exec(command, (error) => {
      if (error) {
        console.error("Error copying to clipboard:", error.message);
      } else {
        console.log("Text copied to clipboard!");
      }
    });
  };

  const getSelectedText = () => {
    if (visualMode === "none") return "";

    const start = Math.min(visualStart, visualEnd);
    const end = Math.max(visualStart, visualEnd);

    if (view === "diff" && diffContent) {
      const lines = diffContent.split("\n");
      if (visualMode === "line") {
        return lines.slice(start, end + 1).join("\n");
      } else {
        // Character mode - for simplicity, we'll treat it as line selection
        return lines.slice(start, end + 1).join("\n");
      }
    }

    if (view === "file" && fileContent) {
      const lines = fileContent.split("\n");
      if (visualMode === "line") {
        return lines.slice(start, end + 1).join("\n");
      } else {
        return lines.slice(start, end + 1).join("\n");
      }
    }

    return "";
  };

  useInput((input, key) => {
    // Handle escape key
    if (key.escape) {
      if (visualMode !== "none") {
        // Exit visual mode
        setVisualMode("none");
        setVisualStart(0);
        setVisualEnd(0);
        return;
      }

      if (view === "commits") {
        setView("branches");
        setSelectedIndex(0);
      } else if (view === "files") {
        setView("commits");
        setSelectedFile(0);
      } else if (view === "file") {
        setView("files");
        setFileScrollOffset(0);
        setFileCursor(0);
      } else if (view === "diff") {
        setView("files");
        setDiffScrollOffset(0);
      } else {
        exit();
      }
      return;
    }

    // Handle visual mode entry
    if (
      (input === "v" || input === "V") &&
      (view === "diff" || view === "file")
    ) {
      const isLine = input === "V";
      if (visualMode === "none") {
        setVisualMode(isLine ? "line" : "character");
        const anchor = view === "diff" ? diffScrollOffset : fileCursor;
        setVisualStart(anchor);
        setVisualEnd(anchor);
      } else {
        setVisualMode("none");
        setVisualStart(0);
        setVisualEnd(0);
      }
      return;
    }

    // Handle yank (copy to clipboard)
    if (input === "y" && visualMode !== "none") {
      const selectedText = getSelectedText();
      if (selectedText) {
        copyToClipboard(selectedText);
        setVisualMode("none");
        setVisualStart(0);
        setVisualEnd(0);
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
        const selectedCommitObj = commits[selectedCommit];
        if (selectedCommitObj) {
          loadFiles(selectedCommitObj);
          setView("files");
        }
      } else if (view === "files") {
        const selectedFileObj = files[selectedFile];
        if (selectedFileObj) {
          const commitHash = commits[selectedCommit].split(" ")[0];
          loadCommitMetadata(commitHash);
          loadDiff(commitHash, selectedFileObj);
          setView("diff");
        }
      }
      return;
    }

    // Vim keybindings: j/k for navigation
    if (input === "j" || key.downArrow) {
      if (view === "branches") {
        setSelectedIndex(Math.min(branches.length - 1, selectedIndex + 1));
      } else if (view === "commits") {
        setSelectedCommit(Math.min(commits.length - 1, selectedCommit + 1));
      } else if (view === "files") {
        setSelectedFile(Math.min(files.length - 1, selectedFile + 1));
      } else if (view === "diff") {
        const newOffset = diffScrollOffset + 1;
        setDiffScrollOffset(newOffset);

        // Update visual selection if in visual mode
        if (visualMode !== "none") {
          setVisualEnd(newOffset);
        }
      } else if (view === "file") {
        const lines = fileContent ? fileContent.split("\n") : [];
        const newCursor = Math.min(lines.length - 1, fileCursor + 1);
        setFileCursor(newCursor);
        const visibleLines = 20;
        const maxOffset = Math.max(0, newCursor - (visibleLines - 1));
        if (newCursor >= fileScrollOffset + visibleLines) {
          setFileScrollOffset(
            Math.min(maxOffset, Math.max(0, lines.length - visibleLines))
          );
        }
        if (visualMode !== "none") {
          setVisualEnd(newCursor);
        }
      }
      return;
    }

    if (input === "k" || key.upArrow) {
      if (view === "branches") {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      } else if (view === "commits") {
        setSelectedCommit(Math.max(0, selectedCommit - 1));
      } else if (view === "files") {
        setSelectedFile(Math.max(0, selectedFile - 1));
      } else if (view === "diff") {
        const newOffset = Math.max(0, diffScrollOffset - 1);
        setDiffScrollOffset(newOffset);

        // Update visual selection if in visual mode
        if (visualMode !== "none") {
          setVisualEnd(newOffset);
        }
      } else if (view === "file") {
        const newCursor = Math.max(0, fileCursor - 1);
        setFileCursor(newCursor);
        if (newCursor < fileScrollOffset) {
          setFileScrollOffset(newCursor);
        }
        if (visualMode !== "none") {
          setVisualEnd(newCursor);
        }
      }
      return;
    }

    // Vim keybindings: Ctrl+d/Ctrl+u for half-page scrolling in diff view
    if (view === "diff") {
      if (key.ctrl && input === "d") {
        const newOffset = diffScrollOffset + 10;
        setDiffScrollOffset(newOffset);
        if (visualMode !== "none") {
          setVisualEnd(newOffset);
        }
        return;
      }
      if (key.ctrl && input === "u") {
        const newOffset = Math.max(0, diffScrollOffset - 10);
        setDiffScrollOffset(newOffset);
        if (visualMode !== "none") {
          setVisualEnd(newOffset);
        }
        return;
      }
      if (key.pageUp) {
        const newOffset = Math.max(0, diffScrollOffset - 10);
        setDiffScrollOffset(newOffset);
        if (visualMode !== "none") {
          setVisualEnd(newOffset);
        }
      } else if (key.pageDown) {
        const newOffset = diffScrollOffset + 10;
        setDiffScrollOffset(newOffset);
        if (visualMode !== "none") {
          setVisualEnd(newOffset);
        }
      }
    }

    if (view === "file") {
      const lines = fileContent ? fileContent.split("\n") : [];
      const visibleLines = 20;
      if (key.ctrl && input === "d") {
        const newCursor = Math.min(lines.length - 1, fileCursor + 10);
        setFileCursor(newCursor);
        const newOffset = Math.min(
          Math.max(0, fileScrollOffset + 10),
          Math.max(0, lines.length - visibleLines)
        );
        setFileScrollOffset(newOffset);
        if (visualMode !== "none") setVisualEnd(newCursor);
        return;
      }
      if (key.ctrl && input === "u") {
        const newCursor = Math.max(0, fileCursor - 10);
        setFileCursor(newCursor);
        const newOffset = Math.max(0, fileScrollOffset - 10);
        setFileScrollOffset(newOffset);
        if (visualMode !== "none") setVisualEnd(newCursor);
        return;
      }
      if (key.pageUp) {
        const newCursor = Math.max(0, fileCursor - 10);
        setFileCursor(newCursor);
        const newOffset = Math.max(0, fileScrollOffset - 10);
        setFileScrollOffset(newOffset);
        if (visualMode !== "none") setVisualEnd(newCursor);
      } else if (key.pageDown) {
        const newCursor = Math.min(lines.length - 1, fileCursor + 10);
        setFileCursor(newCursor);
        const newOffset = Math.min(
          Math.max(0, fileScrollOffset + 10),
          Math.max(0, lines.length - visibleLines)
        );
        setFileScrollOffset(newOffset);
        if (visualMode !== "none") setVisualEnd(newCursor);
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
        Select a branch (↑↓ or j/k to navigate, Enter to select, Esc to exit):
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
      <Text color="gray">Commits in {branches[selectedIndex]}</Text>
      <Text color="yellow">
        Select a commit (↑↓ or j/k to navigate, Enter to select, Esc to go
        back):
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
      <Box flexDirection="column" marginBottom={1}>
        <Text color="gray">Files in commit: {commits[selectedCommit]}</Text>
        <Text color="yellow">
          Select a file (↑↓ or j/k to navigate, Enter to view diff, Esc to go
          back):
        </Text>
      </Box>
      {files.map((file, index) => (
        <Text key={index} color={index === selectedFile ? "green" : "white"}>
          {index === selectedFile ? "▶ " : "  "}
          {file}
        </Text>
      ))}
    </Box>
  );

  const renderFile = () => {
    const lines = fileContent ? fileContent.split("\n") : ["(empty file)"];
    const visibleLines = 20;
    const startLine = Math.max(
      0,
      Math.min(fileScrollOffset, Math.max(0, lines.length - visibleLines))
    );
    const endLine = Math.min(startLine + visibleLines, lines.length);

    return (
      <Box flexDirection="column" height="100%">
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color="cyan">
            Commit: {commitMetadata?.hash}
          </Text>
          <Text color="white">File: {currentFilePath}</Text>
          <Box marginTop={1}>
            <Text color="yellow">
              j/k or ↑/↓ to move line, Ctrl+d/Ctrl+u half-page, v/V visual mode,
              y yank, Esc back
            </Text>
          </Box>
        </Box>

        <Box flexDirection="column" flexGrow={1}>
          {lines.slice(startLine, endLine).map((content, idx) => {
            const globalIndex = startLine + idx;
            const isCursor =
              globalIndex === fileCursor && visualMode === "none";
            const isSelected =
              visualMode !== "none" &&
              globalIndex >= Math.min(visualStart, visualEnd) &&
              globalIndex <= Math.max(visualStart, visualEnd);
            const lineNo = (globalIndex + 1).toString().padStart(6, " ");
            return (
              <Text
                key={globalIndex}
                color={isSelected ? "black" : isCursor ? "black" : "white"}
                backgroundColor={
                  isSelected ? "yellow" : isCursor ? "cyan" : undefined
                }
              >
                {lineNo} | {content}
              </Text>
            );
          })}
        </Box>
      </Box>
    );
  };

  const parseDiffContent = (content: string) => {
    const lines = content.split("\n");
    const parsed: {
      metadata: {
        hash: string;
        author: string;
        date: string;
        message: string;
      } | null;
      fileStats: Array<{
        file: string;
        changes: string;
        visual: string;
      }>;
      fileDiffs: Array<{
        header: string;
        oldPath: string;
        newPath: string;
        hunks: Array<{
          header: string;
          lines: Array<{
            content: string;
            type: "added" | "removed" | "context";
          }>;
        }>;
      }>;
    } = {
      metadata: null,
      fileStats: [],
      fileDiffs: [],
    };

    let currentFile: {
      header: string;
      oldPath: string;
      newPath: string;
      hunks: Array<{
        header: string;
        lines: Array<{
          content: string;
          type: "added" | "removed" | "context";
        }>;
      }>;
    } | null = null;
    let currentHunk: {
      header: string;
      lines: Array<{
        content: string;
        type: "added" | "removed" | "context";
      }>;
    } | null = null;
    let inFileDiff = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse commit metadata
      if (line.startsWith("commit ")) {
        parsed.metadata = {
          hash: line.split(" ")[1],
          author: "",
          date: "",
          message: "",
        };
      } else if (line.startsWith("Author: ")) {
        if (parsed.metadata)
          parsed.metadata.author = line.replace("Author: ", "");
      } else if (line.startsWith("Date: ")) {
        if (parsed.metadata) parsed.metadata.date = line.replace("Date: ", "");
      } else if (
        line.startsWith("    ") &&
        parsed.metadata &&
        !parsed.metadata.message
      ) {
        if (parsed.metadata) {
          parsed.metadata.message = line.trim();
        }
      }

      // Parse file stats
      if (line.includes("|") && line.includes("+++") && line.includes("---")) {
        const match = line.match(/^(.+?)\s+\|\s+(\d+)\s+([+-]+)$/);
        if (match) {
          parsed.fileStats.push({
            file: match[1].trim(),
            changes: match[2],
            visual: match[3],
          });
        }
      }

      // Parse file headers
      if (line.startsWith("diff --git")) {
        if (currentFile) {
          parsed.fileDiffs.push(currentFile);
        }
        currentFile = {
          header: line,
          oldPath: "",
          newPath: "",
          hunks: [],
        };
        inFileDiff = true;
      } else if (line.startsWith("--- a/")) {
        if (currentFile) currentFile.oldPath = line.replace("--- a/", "");
      } else if (line.startsWith("+++ b/")) {
        if (currentFile) currentFile.newPath = line.replace("+++ b/", "");
      } else if (line.startsWith("@@")) {
        if (currentFile) {
          if (currentHunk) {
            currentFile.hunks.push(currentHunk);
          }
          currentHunk = {
            header: line,
            lines: [],
          };
        }
      } else if (inFileDiff && currentHunk) {
        currentHunk.lines.push({
          content: line,
          type: line.startsWith("+")
            ? "added"
            : line.startsWith("-")
            ? "removed"
            : "context",
        });
      }
    }

    if (currentFile) {
      if (currentHunk) {
        currentFile.hunks.push(currentHunk);
      }
      parsed.fileDiffs.push(currentFile);
    }

    return parsed;
  };

  const renderDiff = () => {
    if (!commitMetadata || !diffContent) {
      return (
        <Box flexDirection="column">
          <Text color="yellow">Loading diff...</Text>
        </Box>
      );
    }

    const parsed = parseDiffContent(diffContent);
    const isWide = terminalWidth >= 100;
    const visibleLines = 20;

    // Build renderable rows for the first (or only) file diff
    const file = parsed.fileDiffs[0];

    type UnifiedRow = { kind: "unified"; text: string; color: any };
    type SplitRow = {
      kind: "split";
      leftText: string;
      leftType: "removed" | "context" | "empty";
      rightText: string;
      rightType: "added" | "context" | "empty";
    };

    const clampText = (text: string, width: number) => {
      if (width <= 0) return "";
      if (!text) return "";
      return text.length > width ? text.slice(0, width) : text;
    };

    const buildUnifiedRows = (): UnifiedRow[] => {
      if (!file) return [];
      const rows: UnifiedRow[] = [];
      file.hunks.forEach((hunk) => {
        // Hunk header
        rows.push({ kind: "unified", text: hunk.header, color: "cyan" });
        hunk.lines.forEach((line) => {
          const color =
            line.type === "added"
              ? "green"
              : line.type === "removed"
              ? "red"
              : "white";
          rows.push({ kind: "unified", text: line.content, color });
        });
      });
      return rows;
    };

    const buildSplitRows = (): SplitRow[] => {
      if (!file) return [];
      const rows: SplitRow[] = [];
      file.hunks.forEach((hunk) => {
        // For readability, keep the hunk header as a full-width (unified) row by encoding as context on both sides
        rows.push({
          kind: "split",
          leftText: hunk.header,
          leftType: "context",
          rightText: hunk.header,
          rightType: "context",
        });

        const lines = hunk.lines;
        let i = 0;
        while (i < lines.length) {
          const line = lines[i];
          if (line.type === "context") {
            const text = line.content.replace(/^\s/, "");
            rows.push({
              kind: "split",
              leftText: text,
              leftType: "context",
              rightText: text,
              rightType: "context",
            });
            i += 1;
            continue;
          }

          if (line.type === "removed") {
            const removed: string[] = [];
            while (i < lines.length && lines[i].type === "removed") {
              removed.push(lines[i].content.replace(/^-/u, ""));
              i += 1;
            }
            const added: string[] = [];
            let j = i;
            while (j < lines.length && lines[j].type === "added") {
              added.push(lines[j].content.replace(/^\+/u, ""));
              j += 1;
            }
            // Pair them
            const maxLen = Math.max(removed.length, added.length);
            for (let k = 0; k < maxLen; k++) {
              rows.push({
                kind: "split",
                leftText: removed[k] ?? "",
                leftType: removed[k] != null ? "removed" : "empty",
                rightText: added[k] ?? "",
                rightType: added[k] != null ? "added" : "empty",
              });
            }
            i = j;
            continue;
          }

          if (line.type === "added") {
            const added: string[] = [];
            while (i < lines.length && lines[i].type === "added") {
              added.push(lines[i].content.replace(/^\+/u, ""));
              i += 1;
            }
            const maxLen = Math.max(0, added.length);
            for (let k = 0; k < maxLen; k++) {
              rows.push({
                kind: "split",
                leftText: "",
                leftType: "empty",
                rightText: added[k] ?? "",
                rightType: "added",
              });
            }
            continue;
          }

          // Fallback safety
          rows.push({
            kind: "split",
            leftText: line.content,
            leftType: "context",
            rightText: line.content,
            rightType: "context",
          });
          i += 1;
        }
      });
      return rows;
    };

    const startRow = diffScrollOffset;
    const panelGap = 3; // space for divider " | "
    const panelWidth = Math.max(10, Math.floor((terminalWidth - panelGap) / 2));

    return (
      <Box flexDirection="column" height="100%">
        {/* Commit Header */}
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color="cyan">
            Commit: {commitMetadata.hash}
          </Text>
          <Text color="white">Author: {commitMetadata.author}</Text>
          <Text color="white">Date: {commitMetadata.authorDate}</Text>
          <Box marginTop={1}>
            <Text color="yellow">{commitMetadata.message}</Text>
          </Box>
        </Box>

        {/* File Stats */}
        {parsed.fileStats.length > 0 && (
          <Box flexDirection="column" marginBottom={1}>
            <Text bold color="green">
              Files changed:
            </Text>
            {parsed.fileStats.map((stat, index) => (
              <Text key={index} color="white">
                {stat.file} | {stat.changes} {stat.visual}
              </Text>
            ))}
          </Box>
        )}

        {/* Diff Content */}
        <Box flexDirection="column" flexGrow={1}>
          <Box marginBottom={1}>
            {visualMode !== "none" && (
              <Text color="cyan" bold>
                VISUAL {visualMode.toUpperCase()} MODE - Press 'y' to yank, Esc
                to exit
              </Text>
            )}
            <Text color="yellow">
              ↑↓ or j/k to scroll, Ctrl+d/Ctrl+u for half-page, v/V for visual
              mode, y to yank, Esc to go back
            </Text>
          </Box>
          {!file && <Text color="gray">No diff content to display.</Text>}
          {file && (
            <Box flexDirection="column">
              <Text bold color="blue">
                {file.header}
              </Text>
              <Text color="magenta">--- a/{file.oldPath}</Text>
              <Text color="magenta">+++ b/{file.newPath}</Text>

              {/* Scrolling area */}
              {(() => {
                if (isWide) {
                  const rows = buildSplitRows();
                  const endRow = Math.min(startRow + visibleLines, rows.length);
                  return rows.slice(startRow, endRow).map((row, idx) => {
                    const leftColor =
                      row.leftType === "removed"
                        ? "red"
                        : row.leftType === "context"
                        ? "white"
                        : "gray";
                    const rightColor =
                      row.rightType === "added"
                        ? "green"
                        : row.rightType === "context"
                        ? "white"
                        : "gray";
                    return (
                      <Box key={idx} flexDirection="row">
                        <Box width={panelWidth}>
                          <Text color={leftColor}>
                            {clampText(row.leftText, panelWidth)}
                          </Text>
                        </Box>
                        <Box width={panelGap}>
                          <Text> | </Text>
                        </Box>
                        <Box width={panelWidth}>
                          <Text color={rightColor}>
                            {clampText(row.rightText, panelWidth)}
                          </Text>
                        </Box>
                      </Box>
                    );
                  });
                } else {
                  const rows = buildUnifiedRows();
                  const endRow = Math.min(startRow + visibleLines, rows.length);
                  return rows.slice(startRow, endRow).map((row, idx) => (
                    <Text key={idx} color={row.color}>
                      {row.text}
                    </Text>
                  ));
                }
              })()}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" padding={1}>
      {view === "branches" && renderBranches()}
      {view === "commits" && renderCommits()}
      {view === "files" && renderFiles()}
      {view === "diff" && renderDiff()}
      {view === "file" && renderFile()}
      {view !== "diff" && (
        <Box marginTop={1}>
          <Text color="gray">Press Esc to go back/exit</Text>
        </Box>
      )}
    </Box>
  );
};

render(<App />);
