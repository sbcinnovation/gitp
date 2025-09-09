import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../../state/store";

export const Branches: React.FC = () => {
  const branches = useAppStore((s) => s.branches);
  const currentBranch = useAppStore((s) => s.currentBranch);
  const selectedIndex = useAppStore((s) => s.selectedBranchIndex);
  const branchesScrollOffset = useAppStore((s) => s.branchesScrollOffset);

  const visibleLines = 20;
  const start = branchesScrollOffset;
  const end = Math.min(start + visibleLines, branches.length);

  return (
    <Box flexDirection="column">
      <Text bold color="green">
        GITP - Git Branch Explorer
      </Text>
      <Text color="blue">Current Branch: {currentBranch}</Text>
      <Text color="yellow">
        Select a branch (↑↓ or j/k to navigate, Enter to select, Esc to exit):
      </Text>
      {branches.slice(start, end).map((branch, idx) => {
        const realIndex = start + idx;
        const active = realIndex === selectedIndex;
        return (
          <Text key={realIndex} color={active ? "green" : "white"}>
            {active ? "▶ " : "  "}
            {branch}
          </Text>
        );
      })}
    </Box>
  );
};

export default Branches;
