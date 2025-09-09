export const parseDiffContent = (content: string) => {
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
      parsed.metadata.message = line.trim();
    }

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

    if (line.startsWith("diff --git")) {
      if (currentFile) parsed.fileDiffs.push(currentFile);
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
        if (currentHunk) currentFile.hunks.push(currentHunk);
        currentHunk = { header: line, lines: [] };
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
    if (currentHunk) currentFile.hunks.push(currentHunk);
    parsed.fileDiffs.push(currentFile);
  }

  return parsed;
};
