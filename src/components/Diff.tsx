import React, { useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../store";
import { parseDiffContent } from "../internal/utils/diff";

export const Diff: React.FC = () => {
  const commitMetadata = useAppStore((s) => s.commitMetadata);
  const diffContent = useAppStore((s) => s.diffContent);
  const terminalWidth = useAppStore((s) => s.terminalWidth);
  const diffCursor = useAppStore((s) => s.diffCursor);
  const diffScrollOffset = useAppStore((s) => s.diffScrollOffset);
  const setDiffScrollOffset = useAppStore((s) => s.setDiffScrollOffset);
  const setDiffCursor = useAppStore((s) => s.setDiffCursor);
  const setDiffDisplayRows = useAppStore((s) => s.setDiffDisplayRows);
  const setDiffIsWide = useAppStore((s) => s.setDiffIsWide);
  const visualMode = useAppStore((s) => s.visualMode);
  const visualStart = useAppStore((s) => s.visualStart);
  const visualEnd = useAppStore((s) => s.visualEnd);

  const parsed = useMemo(() => parseDiffContent(diffContent), [diffContent]);

  const isWide = terminalWidth >= 100;
  const visibleLines = 20;

  type UnifiedRow = { kind: "unified"; text: string; color: any };
  type SplitRow = {
    kind: "split";
    leftText: string;
    leftType: "removed" | "context" | "empty";
    rightText: string;
    rightType: "added" | "context" | "empty";
  };

  const clampText = (text: string, width: number): string => {
    if (width <= 0) return "";
    if (!text) return "";
    return text.length > width ? text.slice(0, width) : text;
  };

  const file = parsed.fileDiffs[0];

  const buildUnifiedRows = (): UnifiedRow[] => {
    if (!file) return [];
    const rows: UnifiedRow[] = [];
    file.hunks.forEach((hunk) => {
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
            removed.push(lines[i].content.replace(/^-/, ""));
            i += 1;
          }
          const added: string[] = [];
          let j = i;
          while (j < lines.length && lines[j].type === "added") {
            added.push(lines[j].content.replace(/^\+/, ""));
            j += 1;
          }
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
            added.push(lines[i].content.replace(/^\+/, ""));
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

  const computedRows = useMemo(
    () =>
      isWide ? (buildSplitRows() as any[]) : (buildUnifiedRows() as any[]),
    [isWide, diffContent, terminalWidth]
  );

  useEffect(() => {
    setDiffIsWide(isWide);
    setDiffDisplayRows(computedRows as any);
    const total = computedRows.length;
    setDiffCursor(Math.max(0, Math.min(diffCursor, Math.max(0, total - 1))));
    setDiffScrollOffset(
      Math.max(0, Math.min(diffScrollOffset, Math.max(0, total - visibleLines)))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffContent, terminalWidth]);

  const startRow = diffScrollOffset;
  const panelGap = 3;
  const panelWidth = Math.max(10, Math.floor((terminalWidth - panelGap) / 2));

  if (!commitMetadata) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">Loading diff...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
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

      <Box flexDirection="column" flexGrow={1}>
        <Box marginBottom={1}>
          {useAppStore.getState().visualMode !== "none" && (
            <Text color="cyan" bold>
              VISUAL {useAppStore.getState().visualMode.toUpperCase()} MODE -
              Press 'y' to yank, Esc to exit
            </Text>
          )}
          <Text color="yellow">
            ↑↓ or j/k to scroll, Ctrl+d/Ctrl+u half-page, [ and ] prev/next
            file, f view file, v/V visual mode, y yank, Esc back
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
                  const globalIndex = startRow + idx;
                  const isCursor =
                    visualMode === "none" && globalIndex === diffCursor;
                  const isSelected =
                    visualMode !== "none" &&
                    globalIndex >= Math.min(visualStart, visualEnd) &&
                    globalIndex <= Math.max(visualStart, visualEnd);
                  const backgroundColor = isSelected
                    ? "yellow"
                    : isCursor
                    ? "cyan"
                    : undefined;
                  const leftFg = isSelected || isCursor ? "black" : leftColor;
                  const rightFg = isSelected || isCursor ? "black" : rightColor;
                  return (
                    <Box key={idx} flexDirection="row">
                      <Box width={panelWidth}>
                        <Text color={leftFg} backgroundColor={backgroundColor}>
                          {clampText(row.leftText, panelWidth)}
                        </Text>
                      </Box>
                      <Box width={panelGap}>
                        <Text backgroundColor={backgroundColor}> | </Text>
                      </Box>
                      <Box width={panelWidth}>
                        <Text color={rightFg} backgroundColor={backgroundColor}>
                          {clampText(row.rightText, panelWidth)}
                        </Text>
                      </Box>
                    </Box>
                  );
                });
              } else {
                const rows = buildUnifiedRows();
                const endRow = Math.min(startRow + visibleLines, rows.length);
                return rows.slice(startRow, endRow).map((row, idx) => {
                  const globalIndex = startRow + idx;
                  const isCursor =
                    visualMode === "none" && globalIndex === diffCursor;
                  const isSelected =
                    visualMode !== "none" &&
                    globalIndex >= Math.min(visualStart, visualEnd) &&
                    globalIndex <= Math.max(visualStart, visualEnd);
                  const backgroundColor = isSelected
                    ? "yellow"
                    : isCursor
                    ? "cyan"
                    : undefined;
                  const color = isSelected || isCursor ? "black" : row.color;
                  return (
                    <Text
                      key={idx}
                      color={color}
                      backgroundColor={backgroundColor}
                    >
                      {row.text}
                    </Text>
                  );
                });
              }
            })()}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Diff;
