import React, { useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { useAppStore } from "../../state/store";
import Branches from "../components/Branches";
import { Commits } from "../components/Commits";
import { Files } from "../components/Files";
import { Diff } from "../components/Diff";
import { FileView } from "../components/FileView";
import * as Git from "../../utils/git";
import { copyToClipboard } from "../../utils/clipboard";

export const App: React.FC = () => {
  const { exit } = useApp();

  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const setTerminalWidth = useAppStore((s) => s.setTerminalWidth);

  const branches = useAppStore((s) => s.branches);
  const setBranches = useAppStore((s) => s.setBranches);
  const currentBranch = useAppStore((s) => s.currentBranch);
  const setCurrentBranch = useAppStore((s) => s.setCurrentBranch);
  const selectedBranchIndex = useAppStore((s) => s.selectedBranchIndex);
  const setSelectedBranchIndex = useAppStore((s) => s.setSelectedBranchIndex);

  const commits = useAppStore((s) => s.commits);
  const setCommits = useAppStore((s) => s.setCommits);
  const selectedCommitIndex = useAppStore((s) => s.selectedCommitIndex);
  const setSelectedCommitIndex = useAppStore((s) => s.setSelectedCommitIndex);

  const files = useAppStore((s) => s.files);
  const setFiles = useAppStore((s) => s.setFiles);
  const selectedFileIndex = useAppStore((s) => s.selectedFileIndex);
  const setSelectedFileIndex = useAppStore((s) => s.setSelectedFileIndex);

  const setCommitMetadata = useAppStore((s) => s.setCommitMetadata);
  const setDiffContent = useAppStore((s) => s.setDiffContent);
  const diffDisplayRows = useAppStore((s) => s.diffDisplayRows);
  const diffScrollOffset = useAppStore((s) => s.diffScrollOffset);
  const setDiffScrollOffset = useAppStore((s) => s.setDiffScrollOffset);
  const diffCursor = useAppStore((s) => s.diffCursor);
  const setDiffCursor = useAppStore((s) => s.setDiffCursor);
  const visualMode = useAppStore((s) => s.visualMode);
  const setVisualMode = useAppStore((s) => s.setVisualMode);
  const visualStart = useAppStore((s) => s.visualStart);
  const setVisualStart = useAppStore((s) => s.setVisualStart);
  const visualEnd = useAppStore((s) => s.visualEnd);
  const setVisualEnd = useAppStore((s) => s.setVisualEnd);

  const fileContent = useAppStore((s) => s.fileContent);
  const fileScrollOffset = useAppStore((s) => s.fileScrollOffset);
  const setFileScrollOffset = useAppStore((s) => s.setFileScrollOffset);
  const fileCursor = useAppStore((s) => s.fileCursor);
  const setFileCursor = useAppStore((s) => s.setFileCursor);
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const setCurrentFilePath = useAppStore((s) => s.setCurrentFilePath);
  const setFileContent = useAppStore((s) => s.setFileContent);

  useEffect(() => {
    try {
      setBranches(Git.loadBranches());
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Error loading branches:", error.message);
    }
    try {
      setCurrentBranch(Git.loadCurrentBranch());
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Error loading current branch:", error.message);
    }
  }, [setBranches, setCurrentBranch]);

  useEffect(() => {
    const handleResize = () => {
      try {
        setTerminalWidth((process.stdout as any)?.columns || 80);
      } catch {
        setTerminalWidth(80);
      }
    };
    if ((process.stdout as any)?.on) {
      (process.stdout as any).on("resize", handleResize);
    }
    return () => {
      if ((process.stdout as any)?.off) {
        (process.stdout as any).off("resize", handleResize);
      } else if ((process.stdout as any)?.removeListener) {
        (process.stdout as any).removeListener("resize", handleResize);
      }
    };
  }, [setTerminalWidth]);

  const getSelectedText = (): string => {
    if (visualMode === "none") return "";
    const start = Math.min(visualStart, visualEnd);
    const end = Math.max(visualStart, visualEnd);

    if (view === "diff" && diffDisplayRows.length) {
      const slice = diffDisplayRows.slice(start, end + 1);
      const toText = (row: (typeof diffDisplayRows)[number]) => {
        if ((row as any).kind === "unified") return (row as any).unifiedText;
        return `${(row as any).leftText} | ${(row as any).rightText}`;
      };
      return slice.map(toText).join("\n");
    }

    if (view === "file" && fileContent) {
      const lines = fileContent.split("\n");
      return lines.slice(start, end + 1).join("\n");
    }
    return "";
  };

  useInput((input, key) => {
    if (key.escape) {
      if (visualMode !== "none") {
        setVisualMode("none");
        setVisualStart(0);
        setVisualEnd(0);
        return;
      }

      if (view === "commits") {
        setView("branches");
        setSelectedBranchIndex(0);
      } else if (view === "files") {
        setView("commits");
        setSelectedFileIndex(0);
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

    if (
      (input === "v" || input === "V") &&
      (view === "diff" || view === "file")
    ) {
      const isLine = input === "V";
      if (visualMode === "none") {
        setVisualMode(isLine ? "line" : "character");
        const anchor = view === "diff" ? diffCursor : fileCursor;
        setVisualStart(anchor);
        setVisualEnd(anchor);
      } else {
        setVisualMode("none");
        setVisualStart(0);
        setVisualEnd(0);
      }
      return;
    }

    if (input === "y" && visualMode !== "none") {
      const selectedText = getSelectedText();
      if (selectedText) {
        copyToClipboard(selectedText).catch((e) => {
          // eslint-disable-next-line no-console
          console.error("Error copying to clipboard:", e?.message ?? e);
        });
        setVisualMode("none");
        setVisualStart(0);
        setVisualEnd(0);
      }
      return;
    }

    if (key.return) {
      if (view === "branches") {
        const selectedBranch = branches[selectedBranchIndex];
        if (selectedBranch) {
          try {
            const list = Git.loadCommits(selectedBranch);
            setCommits(list);
            setSelectedCommitIndex(0);
            setView("commits");
          } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error("Error loading commits:", error.message);
          }
        }
      } else if (view === "commits") {
        const selectedCommitObj = commits[selectedCommitIndex];
        if (selectedCommitObj) {
          try {
            const list = Git.loadFiles(selectedCommitObj);
            setFiles(list);
            setSelectedFileIndex(0);
            setView("files");
          } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error("Error loading files:", error.message);
          }
        }
      } else if (view === "files") {
        const selectedFileObj = files[selectedFileIndex];
        if (selectedFileObj) {
          const commitHash = commits[selectedCommitIndex].split(" ")[0];
          try {
            const meta = Git.loadCommitMetadata(commitHash);
            setCommitMetadata({
              hash: meta.hash,
              author: meta.author,
              authorDate: meta.authorDate,
              committer: meta.committer,
              commitDate: meta.commitDate,
              message: meta.message,
              subject: meta.subject,
            });
          } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error("Error loading commit metadata:", error.message);
          }
          try {
            const diff = Git.loadDiff(commitHash, selectedFileObj);
            setDiffContent(diff);
          } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error("Error loading diff:", error.message);
          }
          setView("diff");
        }
      }
      return;
    }

    // Open file content directly from Files view
    if (view === "files" && input === "f") {
      const selectedFileObj = files[selectedFileIndex];
      if (selectedFileObj) {
        const commitHash = commits[selectedCommitIndex].split(" ")[0];
        try {
          const meta = Git.loadCommitMetadata(commitHash);
          setCommitMetadata({
            hash: meta.hash,
            author: meta.author,
            authorDate: meta.authorDate,
            committer: meta.committer,
            commitDate: meta.commitDate,
            message: meta.message,
            subject: meta.subject,
          });
        } catch (error: any) {
          // eslint-disable-next-line no-console
          console.error("Error loading commit metadata:", error.message);
        }
        try {
          const content = Git.loadFileAtCommit(commitHash, selectedFileObj);
          setCurrentFilePath(selectedFileObj);
          setFileContent(content);
          setView("file");
        } catch (error: any) {
          // eslint-disable-next-line no-console
          console.error("Error loading file contents:", error.message);
        }
      }
      return;
    }

    if (input === "j" || key.downArrow) {
      if (view === "branches") {
        setSelectedBranchIndex(
          Math.min(branches.length - 1, selectedBranchIndex + 1)
        );
      } else if (view === "commits") {
        setSelectedCommitIndex(
          Math.min(commits.length - 1, selectedCommitIndex + 1)
        );
      } else if (view === "files") {
        setSelectedFileIndex(Math.min(files.length - 1, selectedFileIndex + 1));
      } else if (view === "diff") {
        const total = diffDisplayRows.length;
        const visibleLines = 20;
        const newCursor = Math.min(total - 1, diffCursor + 1);
        setDiffCursor(newCursor);
        if (newCursor >= diffScrollOffset + visibleLines) {
          setDiffScrollOffset(Math.max(0, newCursor - (visibleLines - 1)));
        }
        if (visualMode !== "none") setVisualEnd(newCursor);
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
        if (visualMode !== "none") setVisualEnd(newCursor);
      }
      return;
    }

    if (input === "k" || key.upArrow) {
      if (view === "branches") {
        setSelectedBranchIndex(Math.max(0, selectedBranchIndex - 1));
      } else if (view === "commits") {
        setSelectedCommitIndex(Math.max(0, selectedCommitIndex - 1));
      } else if (view === "files") {
        setSelectedFileIndex(Math.max(0, selectedFileIndex - 1));
      } else if (view === "diff") {
        const newCursor = Math.max(0, diffCursor - 1);
        setDiffCursor(newCursor);
        if (newCursor < diffScrollOffset) setDiffScrollOffset(newCursor);
        if (visualMode !== "none") setVisualEnd(newCursor);
      } else if (view === "file") {
        const newCursor = Math.max(0, fileCursor - 1);
        setFileCursor(newCursor);
        if (newCursor < fileScrollOffset) setFileScrollOffset(newCursor);
        if (visualMode !== "none") setVisualEnd(newCursor);
      }
      return;
    }

    // Toggle file/diff and navigate across files while in diff/file views
    if (view === "diff" && input === "f") {
      const commitHash = commits[selectedCommitIndex].split(" ")[0];
      const selectedFileObj = files[selectedFileIndex];
      if (selectedFileObj) {
        try {
          const content = Git.loadFileAtCommit(commitHash, selectedFileObj);
          setCurrentFilePath(selectedFileObj);
          setFileContent(content);
          setView("file");
        } catch (error: any) {
          // eslint-disable-next-line no-console
          console.error("Error loading file contents:", error.message);
        }
      }
      return;
    }

    if (view === "file" && input === "d") {
      const commitHash = commits[selectedCommitIndex].split(" ")[0];
      const selectedFileObj = files[selectedFileIndex] || currentFilePath;
      if (selectedFileObj) {
        try {
          const diff = Git.loadDiff(commitHash, selectedFileObj);
          setDiffContent(diff);
          setView("diff");
        } catch (error: any) {
          // eslint-disable-next-line no-console
          console.error("Error loading diff:", error.message);
        }
      }
      return;
    }

    if (
      (view === "diff" || view === "file") &&
      (input === "[" || input === "]")
    ) {
      if (!files.length) return;
      const dir = input === "]" ? 1 : -1;
      const newIndex = Math.max(
        0,
        Math.min(files.length - 1, selectedFileIndex + dir)
      );
      if (newIndex !== selectedFileIndex) {
        setSelectedFileIndex(newIndex);
        const commitHash = commits[selectedCommitIndex].split(" ")[0];
        const nextFile = files[newIndex];
        if (view === "diff") {
          try {
            const diff = Git.loadDiff(commitHash, nextFile);
            setDiffContent(diff);
          } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error("Error loading diff:", error.message);
          }
        } else {
          try {
            const content = Git.loadFileAtCommit(commitHash, nextFile);
            setCurrentFilePath(nextFile);
            setFileContent(content);
          } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error("Error loading file contents:", error.message);
          }
        }
      }
      return;
    }

    if (view === "diff") {
      const total = diffDisplayRows.length;
      const visibleLines = 20;
      if (key.ctrl && input === "d") {
        const newCursor = Math.min(total - 1, diffCursor + 10);
        setDiffCursor(newCursor);
        const newOffset = Math.min(
          Math.max(0, diffScrollOffset + 10),
          Math.max(0, total - visibleLines)
        );
        setDiffScrollOffset(newOffset);
        if (visualMode !== "none") setVisualEnd(newCursor);
        return;
      }
      if (key.ctrl && input === "u") {
        const newCursor = Math.max(0, diffCursor - 10);
        setDiffCursor(newCursor);
        const newOffset = Math.max(0, diffScrollOffset - 10);
        setDiffScrollOffset(newOffset);
        if (visualMode !== "none") setVisualEnd(newCursor);
        return;
      }
      if (key.pageUp) {
        const newCursor = Math.max(0, diffCursor - 10);
        setDiffCursor(newCursor);
        const newOffset = Math.max(0, diffScrollOffset - 10);
        setDiffScrollOffset(newOffset);
        if (visualMode !== "none") setVisualEnd(newCursor);
      } else if (key.pageDown) {
        const newCursor = Math.min(total - 1, diffCursor + 10);
        setDiffCursor(newCursor);
        const newOffset = Math.min(
          Math.max(0, diffScrollOffset + 10),
          Math.max(0, total - visibleLines)
        );
        setDiffScrollOffset(newOffset);
        if (visualMode !== "none") setVisualEnd(newCursor);
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

  return (
    <Box flexDirection="column" padding={1}>
      {view === "branches" && <Branches />}
      {view === "commits" && <Commits />}
      {view === "files" && <Files />}
      {view === "diff" && <Diff />}
      {view === "file" && <FileView />}
      {view !== "diff" && (
        <Box marginTop={1}>
          <Text color="gray">Press Esc to go back/exit</Text>
        </Box>
      )}
    </Box>
  );
};

export default App;
