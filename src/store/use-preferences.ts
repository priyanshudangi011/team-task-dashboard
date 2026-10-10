import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SortMode = 'dueDate' | 'title' | 'priority';
export type SortDirection = 'asc' | 'desc';
export type ThemeMode = 'light' | 'dark';
export type StatusFilter = 'all' | 'todo' | 'in_progress' | 'completed';
export type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

export interface DashboardPreferences {
  search: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  assigneeFilter: string;
  sortMode: SortMode;
  sortDirection: SortDirection;
  theme: ThemeMode;
  hasHydrated: boolean;
}

export interface PreferencesActions {
  setSearch: (search: string) => void;
  setStatusFilter: (statusFilter: StatusFilter) => void;
  setPriorityFilter: (priorityFilter: PriorityFilter) => void;
  setAssigneeFilter: (assigneeFilter: string) => void;
  setSortMode: (sortMode: SortMode) => void;
  setSortDirection: (sortDirection: SortDirection) => void;
  setTheme: (theme: ThemeMode) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const initialState: DashboardPreferences = {
  search: '',
  statusFilter: 'all',
  priorityFilter: 'all',
  assigneeFilter: 'all',
  sortMode: 'dueDate',
  sortDirection: 'asc',
  theme: 'light',
  hasHydrated: false,
};

export const usePreferencesStore = create<DashboardPreferences & PreferencesActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSearch: (search) => set({ search }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
      setAssigneeFilter: (assigneeFilter) => set({ assigneeFilter }),
      setSortMode: (sortMode) => set({ sortMode }),
      setSortDirection: (sortDirection) => set({ sortDirection }),
      setTheme: (theme) => set({ theme }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'team-task-dashboard-preferences',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

export type PreferencesStore = DashboardPreferences & PreferencesActions;
