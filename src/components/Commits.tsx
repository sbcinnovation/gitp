import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../store";

export const Commits: React.FC = () => {
  const commits = useAppStore((s) => s.commits);
  const selectedCommit = useAppStore((s) => s.selectedCommitIndex);
  const branches = useAppStore((s) => s.branches);
  const selectedBranchIndex = useAppStore((s) => s.selectedBranchIndex);
  return (
    <Box flexDirection="column">
      <Text color="gray">Commits in {branches[selectedBranchIndex]}</Text>
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
};

export default Commits;
