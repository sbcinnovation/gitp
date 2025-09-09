import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../../state/store";

export const Files: React.FC = () => {
  const commits = useAppStore((s) => s.commits);
  const selectedCommitIndex = useAppStore((s) => s.selectedCommitIndex);
  const files = useAppStore((s) => s.files);
  const selectedFileIndex = useAppStore((s) => s.selectedFileIndex);
  const filesScrollOffset = useAppStore((s) => s.filesScrollOffset);
  const visibleLines = 20;
  const start = filesScrollOffset;
  const end = Math.min(start + visibleLines, files.length);
  return (
    <Box flexDirection="column">
      <Box flexDirection="column" marginBottom={1}>
        <Text color="gray">
          Files in commit: {commits[selectedCommitIndex]}
        </Text>
        <Text color="yellow">
          Select a file (↑↓ or j/k to navigate, Enter to view diff, f to view
          file, Esc to go back):
        </Text>
      </Box>
      {files.slice(start, end).map((file, idx) => {
        const realIndex = start + idx;
        const active = realIndex === selectedFileIndex;
        return (
          <Text key={realIndex} color={active ? "green" : "white"}>
            {active ? "▶ " : "  "}
            {file}
          </Text>
        );
      })}
    </Box>
  );
};

export default Files;
