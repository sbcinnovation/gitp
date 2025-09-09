import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../../state/store";

export const Commits: React.FC = () => {
  const commits = useAppStore((s) => s.commits);
  const selectedCommit = useAppStore((s) => s.selectedCommitIndex);
  const branches = useAppStore((s) => s.branches);
  const selectedBranchIndex = useAppStore((s) => s.selectedBranchIndex);
  const commitsScrollOffset = useAppStore((s) => s.commitsScrollOffset);
  const visibleLines = 18;
  const start = commitsScrollOffset;
  const end = Math.min(start + visibleLines, commits.length);
  return (
    <Box flexDirection="column">
      <Text color="gray">Commits in {branches[selectedBranchIndex]}</Text>
      <Text color="yellow">
        Select a commit (↑↓ or j/k to navigate, Enter to select, Esc to go
        back):
      </Text>
      {commits.slice(start, end).map((commit, idx) => {
        const realIndex = start + idx;
        const active = realIndex === selectedCommit;
        return (
          <Text key={realIndex} color={active ? "green" : "white"}>
            {active ? "▶ " : "  "}
            {commit}
          </Text>
        );
      })}
    </Box>
  );
};

export default Commits;
