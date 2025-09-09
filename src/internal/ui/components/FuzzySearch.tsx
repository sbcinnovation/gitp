import React from "react";
import { Box, Text, useInput } from "ink";
import { useAppStore } from "../../state/store";
import { rankFuzzyMatches } from "../../utils/fuzzy";

export const FuzzySearch: React.FC = () => {
  const searchOpen = useAppStore((s) => s.searchOpen);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const searchMode = useAppStore((s) => s.searchMode);
  const selectedSearchIndex = useAppStore((s) => s.selectedSearchIndex);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setSelectedSearchIndex = useAppStore((s) => s.setSelectedSearchIndex);
  const closeSearch = useAppStore((s) => s.closeSearch);

  const branches = useAppStore((s) => s.branches);
  const commits = useAppStore((s) => s.commits);
  const files = useAppStore((s) => s.files);

  const options =
    searchMode === "branches"
      ? branches
      : searchMode === "commits"
      ? commits
      : searchMode === "files"
      ? files
      : [];
  const results = rankFuzzyMatches(searchQuery, options, 50);

  useInput((input, key) => {
    if (!searchOpen) return;
    if (key.escape) {
      closeSearch();
      return;
    }
    if (key.return) {
      // Selection is handled in App to keep navigation logic centralized
      return;
    }
    if (input === "j" || key.downArrow) {
      const newIndex = Math.min(results.length - 1, selectedSearchIndex + 1);
      setSelectedSearchIndex(newIndex);
      return;
    }
    if (input === "k" || key.upArrow) {
      const newIndex = Math.max(0, selectedSearchIndex - 1);
      setSelectedSearchIndex(newIndex);
      return;
    }
    if (key.backspace || key.delete) {
      setSearchQuery(searchQuery.slice(0, -1));
      return;
    }
    if (input && input.length === 1 && !key.ctrl && !key.meta) {
      setSearchQuery(searchQuery + input);
    }
  });

  if (!searchOpen) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
    >
      <Text>/{searchQuery || ""}</Text>
      {results.length === 0 && <Text color="gray">No matches</Text>}
      {results.slice(0, 10).map((r, idx) => {
        const active = idx === selectedSearchIndex;
        return (
          <Text key={r.item} color={active ? "green" : "white"}>
            {active ? "▶ " : "  "}
            {r.item}
          </Text>
        );
      })}
    </Box>
  );
};

export default FuzzySearch;
