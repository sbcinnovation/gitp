import { execFileSync, execSync } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";

let cachedRepoRoot: string | null = null;

const detectRepoRoot = (): string | null => {
  // Try git toplevel first
  try {
    const out = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    if (out) return out;
  } catch {
    // ignore
  }
  // Fallback: walk up for a .git marker
  try {
    let dir = process.cwd();
    for (;;) {
      const marker = join(dir, ".git");
      if (existsSync(marker)) return dir;
      const parent = dirname(dir);
      if (!parent || parent === dir) break;
      dir = parent;
    }
  } catch {
    // ignore
  }
  return null;
};

const getRepoRoot = (): string | undefined => {
  if (cachedRepoRoot !== null) return cachedRepoRoot || undefined;
  const root = detectRepoRoot();
  cachedRepoRoot = root ?? "";
  return root ?? undefined;
};

const runGit = (args: string[]): string => {
  const root = getRepoRoot();
  const finalArgs = root ? ["-C", root, ...args] : args;
  return execFileSync("git", finalArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).toString();
};

export const loadBranches = (): string[] => {
  const output = runGit(["branch", "-a"]);
  return output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.trim().replace(/^\*?\s*/, ""));
};

export const loadCurrentBranch = (): string => {
  const output = runGit(["branch", "--show-current"]);
  return output.trim();
};

export const loadCommits = (branch: string): string[] => {
  const output = runGit(["log", "--oneline", "--max-count=50", branch]);
  return output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.trim());
};

export const loadFiles = (commit: string): string[] => {
  const output = runGit(["show", "--name-only", commit.split(" ")[0]]);
  return output
    .split("\n")
    .filter(
      (line) =>
        line.trim() &&
        !line.startsWith("commit") &&
        !line.startsWith("Author") &&
        !line.startsWith("Date") &&
        !line.startsWith("    ")
    )
    .map((line) => line.trim());
};

export type CommitMetadata = {
  hash: string;
  author: string;
  authorDate: string;
  committer: string;
  commitDate: string;
  message: string;
  subject: string;
};

export const loadCommitMetadata = (commitHash: string): CommitMetadata => {
  const output = runGit(["show", "--format=fuller", commitHash]);
  const lines = output.split("\n");
  const metadata: CommitMetadata = {
    hash: commitHash,
    author: "",
    authorDate: "",
    committer: "",
    commitDate: "",
    message: "",
    subject: "",
  };

  let inMessage = false;
  const messageLines: string[] = [];

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
    } else if (inMessage && (line.startsWith("    ") || line.trim() === "")) {
      messageLines.push(line.trim());
    } else if (inMessage && !line.startsWith("    ")) {
      break;
    }
  }

  metadata.message = messageLines.join("\n");
  return metadata;
};

export const loadDiff = (commitHash: string, filePath?: string): string => {
  const fileArg = filePath ? ` -- "${filePath}"` : "";
  const output = filePath
    ? runGit(["show", "--stat", "--patch", commitHash, "--", filePath])
    : runGit(["show", "--stat", "--patch", commitHash]);
  return output;
};

export const loadFileAtCommit = (
  commitHash: string,
  filePath: string
): string => {
  try {
    const output = runGit(["show", "--textconv", `${commitHash}:${filePath}`]);
    return output;
  } catch (error: any) {
    return `Unable to display this file at the selected commit. It may be binary or unavailable.\n\nDetails: ${error.message}`;
  }
};
