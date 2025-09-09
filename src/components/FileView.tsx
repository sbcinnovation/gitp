import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../store";

export const FileView: React.FC = () => {
  const commitMetadata = useAppStore((s) => s.commitMetadata);
  const fileContent = useAppStore((s) => s.fileContent);
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const fileCursor = useAppStore((s) => s.fileCursor);
  const visualMode = useAppStore((s) => s.visualMode);
  const visualStart = useAppStore((s) => s.visualStart);
  const visualEnd = useAppStore((s) => s.visualEnd);
  const fileScrollOffset = useAppStore((s) => s.fileScrollOffset);

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
            j/k or ↑/↓ to move line, Ctrl+d/Ctrl+u half-page, v/V visual mode, y
            yank, Esc back
          </Text>
        </Box>
      </Box>
      <Box flexDirection="column" flexGrow={1}>
        {lines.slice(startLine, endLine).map((content, idx) => {
          const globalIndex = startLine + idx;
          const isCursor = globalIndex === fileCursor && visualMode === "none";
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

export default FileView;
