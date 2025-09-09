import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../store";

export const Files: React.FC = () => {
  const commits = useAppStore((s) => s.commits);
  const selectedCommitIndex = useAppStore((s) => s.selectedCommitIndex);
  const files = useAppStore((s) => s.files);
  const selectedFileIndex = useAppStore((s) => s.selectedFileIndex);
  return (
    <Box flexDirection="column">
      <Box flexDirection="column" marginBottom={1}>
        <Text color="gray">
          Files in commit: {commits[selectedCommitIndex]}
        </Text>
        <Text color="yellow">
          Select a file (↑↓ or j/k to navigate, Enter to view diff, Esc to go
          back):
        </Text>
      </Box>
      {files.map((file, index) => (
        <Text
          key={index}
          color={index === selectedFileIndex ? "green" : "white"}
        >
          {index === selectedFileIndex ? "▶ " : "  "}
          {file}
        </Text>
      ))}
    </Box>
  );
};

export default Files;
