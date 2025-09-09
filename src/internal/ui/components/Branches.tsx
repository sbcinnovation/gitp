import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../../state/store";

export const Branches: React.FC = () => {
  const branches = useAppStore((s) => s.branches);
  const currentBranch = useAppStore((s) => s.currentBranch);
  const selectedIndex = useAppStore((s) => s.selectedBranchIndex);

  return (
    <Box flexDirection="column">
      <Text bold color="green">
        GITP - Git Branch Explorer
      </Text>
      <Text color="blue">Current Branch: {currentBranch}</Text>
      <Text color="yellow">
        Select a branch (↑↓ or j/k to navigate, Enter to select, Esc to exit):
      </Text>
      {branches.map((branch, index) => (
        <Text key={index} color={index === selectedIndex ? "green" : "white"}>
          {index === selectedIndex ? "▶ " : "  "}
          {branch}
        </Text>
      ))}
    </Box>
  );
};

export default Branches;
