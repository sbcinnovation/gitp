import { create } from "zustand";

export type ViewKind = "branches" | "commits" | "files" | "diff" | "file";

export type DiffDisplayRow =
  | {
      kind: "unified";
      unifiedText: string;
      unifiedColor: any;
    }
  | {
      kind: "split";
      leftText: string;
      leftType: "removed" | "context" | "empty";
      rightText: string;
      rightType: "added" | "context" | "empty";
    };

export interface CommitMetadata {
  hash: string;
  author: string;
  authorDate: string;
  committer: string;
  commitDate: string;
  message: string;
  subject: string;
}

export interface AppState {
  repoPath: string;
  branches: string[];
  currentBranch: string;
  selectedBranchIndex: number;
  branchesScrollOffset: number;
  commits: string[];
  selectedCommitIndex: number;
  commitsScrollOffset: number;
  files: string[];
  selectedFileIndex: number;
  filesScrollOffset: number;
  view: ViewKind;

  commitMetadata: CommitMetadata | null;
  diffContent: string;
  diffScrollOffset: number;
  diffCursor: number;
  diffDisplayRows: DiffDisplayRow[];
  diffIsWide: boolean;

  visualMode: "none" | "character" | "line";
  visualStart: number;
  visualEnd: number;

  fileContent: string;
  fileScrollOffset: number;
  fileCursor: number;
  currentFilePath: string;
  terminalWidth: number;

  // search UI state
  searchOpen: boolean;
  searchQuery: string;
  searchMode: "branches" | "commits" | "files" | "none";
  selectedSearchIndex: number;

  setRepoPath: (path: string) => void;
  setView: (view: ViewKind) => void;
  setTerminalWidth: (width: number) => void;
  setBranches: (branches: string[]) => void;
  setCurrentBranch: (branch: string) => void;
  setSelectedBranchIndex: (idx: number) => void;
  setBranchesScrollOffset: (offset: number) => void;
  setCommits: (commits: string[]) => void;
  setSelectedCommitIndex: (idx: number) => void;
  setCommitsScrollOffset: (offset: number) => void;
  setFiles: (files: string[]) => void;
  setSelectedFileIndex: (idx: number) => void;
  setFilesScrollOffset: (offset: number) => void;
  setCommitMetadata: (m: CommitMetadata | null) => void;
  setDiffContent: (content: string) => void;
  setDiffScrollOffset: (offset: number) => void;
  setDiffCursor: (cursor: number) => void;
  setDiffDisplayRows: (rows: DiffDisplayRow[]) => void;
  setDiffIsWide: (isWide: boolean) => void;
  setVisualMode: (mode: "none" | "character" | "line") => void;
  setVisualStart: (n: number) => void;
  setVisualEnd: (n: number) => void;
  setFileContent: (content: string) => void;
  setFileScrollOffset: (offset: number) => void;
  setFileCursor: (cursor: number) => void;
  setCurrentFilePath: (path: string) => void;

  // search actions
  openSearch: (mode: "branches" | "commits" | "files") => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedSearchIndex: (idx: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  repoPath: ".",
  branches: [],
  currentBranch: "",
  selectedBranchIndex: 0,
  branchesScrollOffset: 0,
  commits: [],
  selectedCommitIndex: 0,
  commitsScrollOffset: 0,
  files: [],
  selectedFileIndex: 0,
  filesScrollOffset: 0,
  view: "branches",

  commitMetadata: null,
  diffContent: "",
  diffScrollOffset: 0,
  diffCursor: 0,
  diffDisplayRows: [],
  diffIsWide: false,

  visualMode: "none",
  visualStart: 0,
  visualEnd: 0,

  fileContent: "",
  fileScrollOffset: 0,
  fileCursor: 0,
  currentFilePath: "",
  terminalWidth:
    typeof process !== "undefined" && (process.stdout as any)?.columns
      ? (process.stdout as any).columns
      : 80,

  // search UI state
  searchOpen: false,
  searchQuery: "",
  searchMode: "none",
  selectedSearchIndex: 0,

  setRepoPath: (path) => set({ repoPath: path }),
  setView: (view) => set({ view }),
  setTerminalWidth: (width) => set({ terminalWidth: width }),
  setBranches: (branches) =>
    set({ branches, branchesScrollOffset: 0, selectedBranchIndex: 0 }),
  setCurrentBranch: (branch) => set({ currentBranch: branch }),
  setSelectedBranchIndex: (idx) => set({ selectedBranchIndex: idx }),
  setBranchesScrollOffset: (offset) => set({ branchesScrollOffset: offset }),
  setCommits: (commits) =>
    set({ commits, commitsScrollOffset: 0, selectedCommitIndex: 0 }),
  setSelectedCommitIndex: (idx) => set({ selectedCommitIndex: idx }),
  setCommitsScrollOffset: (offset) => set({ commitsScrollOffset: offset }),
  setFiles: (files) =>
    set({ files, filesScrollOffset: 0, selectedFileIndex: 0 }),
  setSelectedFileIndex: (idx) => set({ selectedFileIndex: idx }),
  setFilesScrollOffset: (offset) => set({ filesScrollOffset: offset }),
  setCommitMetadata: (m) => set({ commitMetadata: m }),
  setDiffContent: (content) =>
    set({ diffContent: content, diffScrollOffset: 0, diffCursor: 0 }),
  setDiffScrollOffset: (offset) => set({ diffScrollOffset: offset }),
  setDiffCursor: (cursor) => set({ diffCursor: cursor }),
  setDiffDisplayRows: (rows) => set({ diffDisplayRows: rows }),
  setDiffIsWide: (isWide) => set({ diffIsWide: isWide }),
  setVisualMode: (mode) => set({ visualMode: mode }),
  setVisualStart: (n) => set({ visualStart: n }),
  setVisualEnd: (n) => set({ visualEnd: n }),
  setFileContent: (content) =>
    set({ fileContent: content, fileScrollOffset: 0, fileCursor: 0 }),
  setFileScrollOffset: (offset) => set({ fileScrollOffset: offset }),
  setFileCursor: (cursor) => set({ fileCursor: cursor }),
  setCurrentFilePath: (path) => set({ currentFilePath: path }),

  // search actions
  openSearch: (mode) =>
    set({
      searchOpen: true,
      searchMode: mode,
      searchQuery: "",
      selectedSearchIndex: 0,
    }),
  closeSearch: () =>
    set({
      searchOpen: false,
      searchMode: "none",
      searchQuery: "",
      selectedSearchIndex: 0,
    }),
  setSearchQuery: (query) =>
    set({ searchQuery: query, selectedSearchIndex: 0 }),
  setSelectedSearchIndex: (idx) => set({ selectedSearchIndex: idx }),
}));
