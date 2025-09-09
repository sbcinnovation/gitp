import { execSync } from "child_process";

export const loadBranches = (): string[] => {
  const output = execSync("git branch -a", { encoding: "utf8" });
  return output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.trim().replace(/^\*?\s*/, ""));
};

export const loadCurrentBranch = (): string => {
  const output = execSync("git branch --show-current", { encoding: "utf8" });
  return output.trim();
};

export const loadCommits = (branch: string): string[] => {
  const output = execSync(`git log --oneline --max-count=50 ${branch}`, {
    encoding: "utf8",
  });
  return output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.trim());
};

export const loadFiles = (commit: string): string[] => {
  const output = execSync(`git show --name-only ${commit.split(" ")[0]}`, {
    encoding: "utf8",
  });
  return output
    .split("\n")
    .filter(
      (line) =>
        line.trim() &&
        !line.startsWith("commit") &&
        !line.startsWith("Author") &&
        !line.startsWith("Date")
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
  const output = execSync(`git show --format=fuller ${commitHash}`, {
    encoding: "utf8",
  });
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
  const output = execSync(`git show --stat --patch ${commitHash}${fileArg}`, {
    encoding: "utf8",
  });
  return output;
};

export const loadFileAtCommit = (
  commitHash: string,
  filePath: string
): string => {
  try {
    const output = execSync(`git show --textconv ${commitHash}:${filePath}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return output;
  } catch (error: any) {
    return `Unable to display this file at the selected commit. It may be binary or unavailable.\n\nDetails: ${error.message}`;
  }
};
