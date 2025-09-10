import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../../state/store";
import { VISIBLE_LINES, computeWindow } from "../utils/scroll";

export const Commits: React.FC = () => {
  const commits = useAppStore((s) => s.commits);
  const selectedCommit = useAppStore((s) => s.selectedCommitIndex);
  const branches = useAppStore((s) => s.branches);
  const selectedBranchIndex = useAppStore((s) => s.selectedBranchIndex);
  const commitsScrollOffset = useAppStore((s) => s.commitsScrollOffset);
  const { start, end } = computeWindow(
    commitsScrollOffset,
    commits.length,
    VISIBLE_LINES,
  );
  return (
    <Box flexDirection="column">
      <Text color="gray">Commits in {branches[selectedBranchIndex]}</Text>
      <Text color="yellow">
        Select a commit (↑↓ or j/k to navigate, Enter select, / search, Esc
        back):
      </Text>
      {commits.slice(start, end).map((commit, idx) => {
        const realIndex = start + idx;
        const active = realIndex === selectedCommit;
        const firstSpace = commit.indexOf(" ");
        const hash = firstSpace === -1 ? commit : commit.slice(0, firstSpace);
        const rest = firstSpace === -1 ? "" : commit.slice(firstSpace);
        return (
          <Text key={realIndex} color={active ? "green" : "white"}>
            {active ? "▶ " : "  "}
            <Text color="gray">{hash}</Text>
            {rest}
          </Text>
        );
      })}
    </Box>
  );
};

export default Commits;
