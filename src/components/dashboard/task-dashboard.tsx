'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ListFilter,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
} from 'lucide-react';
import {
  assignTask,
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  updateTaskStatus,
} from '@/lib/mock-api';
import {
  DEFAULT_PAGE_SIZE,
  filterTasks,
  getTaskSummary,
  paginateTasks,
  sortTasks,
  TEAM_MEMBERS,
} from '@/lib/task-utils';
import { Task, TaskDraft, TaskPriority, TaskStatus } from '@/types/task';
import { usePreferencesStore } from '@/store/use-preferences';
import { TaskForm } from './task-form';

const TASKS_QUERY_KEY = ['tasks'] as const;

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const statusCopy: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  completed: 'Completed',
};

const priorityCopy: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const badgeClassByStatus: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
};

const badgeClassByPriority: Record<TaskPriority, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
};

const emptyDraft: TaskDraft = {
  id: '',
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  dueDate: '',
  createdAt: new Date().toISOString().slice(0, 10),
};

export function TaskDashboard() {
  const queryClient = useQueryClient();
  const preferences = usePreferencesStore();
  const theme = preferences.theme;
  const search = preferences.search;
  const statusFilter = preferences.statusFilter;
  const priorityFilter = preferences.priorityFilter;
  const assigneeFilter = preferences.assigneeFilter;
  const sortMode = preferences.sortMode;
  const sortDirection = preferences.sortDirection;

  const [page, setPage] = useState(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formError, setFormError] = useState<string | null>(null);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: tasks = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
  });

  const filteredTasks = useMemo(() => {
    const matched = filterTasks(tasks, {
      search,
      status: statusFilter,
      priority: priorityFilter,
      assignee: assigneeFilter,
    });

    const sorted = sortTasks(matched, sortMode, sortDirection);
    return paginateTasks(sorted, page, DEFAULT_PAGE_SIZE);
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, sortMode, sortDirection, page]);

  useEffect(() => {
    if (page > 1 && filteredTasks.totalPages > 0 && page > filteredTasks.totalPages) {
      setPage(filteredTasks.totalPages);
    }
  }, [filteredTasks.totalPages, page]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, assigneeFilter, sortMode, sortDirection]);

  const summary = useMemo(() => getTaskSummary(tasks), [tasks]);

  const createMutation = useMutation({
    mutationFn: createTask,
    onMutate: async (draft) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      const optimisticTask: Task = {
        id: draft.id || `temp-${Date.now()}`,
        title: draft.title.trim(),
        description: draft.description.trim(),
        status: draft.status,
        priority: draft.priority,
        assignee: draft.assignee,
        dueDate: draft.dueDate,
        createdAt: draft.createdAt || new Date().toISOString().slice(0, 10),
      };
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (current = []) => [optimisticTask, ...current]);
      return { previousTasks };
    },
    onError: (error, _draft, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
      setFormError(error instanceof Error ? error.message : 'Task creation failed. Please try again.');
      setGlobalMessage({ type: 'error', text: 'Task creation failed. Please try again.' });
    },
    onSuccess: () => {
      setGlobalMessage({ type: 'success', text: 'Task created successfully.' });
      setIsFormOpen(false);
      setFormError(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, changes }: { taskId: string; changes: Partial<TaskDraft> }) => updateTask(taskId, changes),
    onMutate: async ({ taskId, changes }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (current = []) =>
        current.map((task) => (task.id === taskId ? { ...task, ...changes } : task)),
      );
      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
      setFormError(error instanceof Error ? error.message : 'The task update failed and was rolled back.');
      setGlobalMessage({ type: 'error', text: 'The task update failed and was rolled back.' });
    },
    onSuccess: () => {
      setGlobalMessage({ type: 'success', text: 'Task updated successfully.' });
      setIsFormOpen(false);
      setFormError(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (current = []) => current.filter((item) => item.id !== taskId));
      return { previousTasks };
    },
    onError: (_error, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
      setGlobalMessage({ type: 'error', text: 'Task deletion failed. The previous changes are restored.' });
    },
    onSuccess: () => {
      setGlobalMessage({ type: 'success', text: 'Task deleted successfully.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (current = []) =>
        current.map((task) => (task.id === taskId ? { ...task, status } : task)),
      );
      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
      setGlobalMessage({ type: 'error', text: 'Status update failed. Changes rolled back.' });
    },
    onSuccess: () => {
      setGlobalMessage({ type: 'success', text: 'Status updated.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const assigneeMutation = useMutation({
    mutationFn: ({ taskId, assignee }: { taskId: string; assignee: string }) => assignTask(taskId, assignee),
    onMutate: async ({ taskId, assignee }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (current = []) =>
        current.map((task) => (task.id === taskId ? { ...task, assignee } : task)),
      );
      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
      setGlobalMessage({ type: 'error', text: 'Assignment failed. Changes rolled back.' });
    },
    onSuccess: () => {
      setGlobalMessage({ type: 'success', text: 'Task assigned successfully.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedTaskId(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setFormMode('edit');
    setSelectedTaskId(task.id);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (draft: TaskDraft) => {
    const trimmedDraft = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee.trim(),
    };

    if (formMode === 'create') {
      createMutation.mutate(trimmedDraft);
      return;
    }

    if (!selectedTaskId) {
      return;
    }

    updateMutation.mutate({ taskId: selectedTaskId, changes: trimmedDraft });
  };

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  const formInitialValues = selectedTask
    ? {
        ...selectedTask,
        description: selectedTask.description || '',
      }
    : { ...emptyDraft, assignee: TEAM_MEMBERS[0] };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-screen flex-col gap-6">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Workspace</p>
                <h1 className="mt-2 text-xl font-bold">Team Ops</h1>
              </div>
              <button
                onClick={() => preferences.setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-xl border border-slate-200 p-2 dark:border-slate-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </aside>

          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Workspace</p>
                <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-50">Team Ops</h1>
              </div>

              <nav className="space-y-2">
                {['Overview', 'Tasks', 'Calendar', 'Reports'].map((item, index) => (
                  <button
                    type="button"
                    key={item}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      index === 1
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="mt-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Sprint health</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">82%</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tasks on track this week</p>
              </div>
            </aside>

            <section className="space-y-6">
              <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Dashboard</p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Team Task Board</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => preferences.setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                      {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>

                    <button
                      type="button"
                      onClick={openCreateForm}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
                    >
                      <Plus size={16} />
                      Create task
                    </button>
                  </div>
                </div>
              </header>

              {globalMessage ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    globalMessage.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {globalMessage.text}
                </div>
              ) : null}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Total tasks', value: summary.total, accent: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300' },
                  { label: 'Completed', value: summary.completed, accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
                  { label: 'In progress', value: summary.inProgress, accent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
                  { label: 'Overdue', value: summary.overdue, accent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300' },
                ].map((card) => (
                  <div key={card.label} className={`rounded-2xl border border-slate-200 p-4 shadow-soft dark:border-slate-800 ${card.accent}`}>
                    <p className="text-sm font-medium">{card.label}</p>
                    <p className="mt-5 text-3xl font-bold">{card.value}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                  <label className="relative block flex-1">
                    <Search className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input
                      value={search}
                      onChange={(event) => preferences.setSearch(event.target.value)}
                      placeholder="Search tasks by title or description"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                      <ListFilter size={16} className="text-slate-500" />
                      <select
                        value={statusFilter}
                        onChange={(event) => preferences.setStatusFilter(event.target.value as typeof statusFilter)}
                        className="bg-transparent text-sm text-slate-700 dark:text-slate-200"
                      >
                        <option value="all">All status</option>
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                      <ListFilter size={16} className="text-slate-500" />
                      <select
                        value={priorityFilter}
                        onChange={(event) => preferences.setPriorityFilter(event.target.value as typeof priorityFilter)}
                        className="bg-transparent text-sm text-slate-700 dark:text-slate-200"
                      >
                        <option value="all">All priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                      <ListFilter size={16} className="text-slate-500" />
                      <select
                        value={assigneeFilter}
                        onChange={(event) => preferences.setAssigneeFilter(event.target.value)}
                        className="bg-transparent text-sm text-slate-700 dark:text-slate-200"
                      >
                        <option value="all">All assignees</option>
                        {TEAM_MEMBERS.map((member) => (
                          <option key={member} value={member}>
                            {member}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                      <ArrowUpDown size={16} className="text-slate-500" />
                      <select
                        value={sortMode}
                        onChange={(event) => preferences.setSortMode(event.target.value as typeof sortMode)}
                        className="bg-transparent text-sm text-slate-700 dark:text-slate-200"
                      >
                        <option value="dueDate">Due date</option>
                        <option value="title">Title</option>
                        <option value="priority">Priority</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => preferences.setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Task list</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {filteredTasks.totalItems} matching tasks • Page {filteredTasks.page} of {filteredTasks.totalPages}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={filteredTasks.page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={filteredTasks.page >= filteredTasks.totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Loading tasks…
                  </div>
                ) : isError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                    <p className="font-semibold">Something went wrong while loading tasks.</p>
                    <p className="mt-2 text-sm">{error instanceof Error ? error.message : 'Please retry.'}</p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredTasks.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <p className="text-lg font-semibold">No matching tasks found.</p>
                    <p className="mt-2 text-sm">Try adjusting search, filters, or create a new task.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.items.map((task) => (
                      <article
                        key={task.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{task.title}</h3>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClassByStatus[task.status]}`}>
                                {statusCopy[task.status]}
                              </span>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClassByPriority[task.priority]}`}>
                                {priorityCopy[task.priority]} priority
                              </span>
                            </div>

                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{task.description}</p>

                            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4 dark:text-slate-300">
                              <div>
                                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Assignee</span>
                                <span className="mt-1 block font-medium">{task.assignee}</span>
                              </div>
                              <div>
                                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Due date</span>
                                <span className="mt-1 block font-medium">{formatDate(task.dueDate)}</span>
                              </div>
                              <div>
                                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Created</span>
                                <span className="mt-1 block font-medium">{formatDate(task.createdAt)}</span>
                              </div>
                              <div>
                                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Status</span>
                                <select
                                  value={task.status}
                                  onChange={(event) => {
                                    const nextStatus = event.target.value as TaskStatus;
                                    statusMutation.mutate({ taskId: task.id, status: nextStatus });
                                  }}
                                  disabled={statusMutation.isPending}
                                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                >
                                  <option value="todo">To do</option>
                                  <option value="in_progress">In progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 xl:min-w-[220px]">
                            <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Assign to</span>
                              <select
                                value={task.assignee}
                                onChange={(event) => {
                                  const nextAssignee = event.target.value;
                                  assigneeMutation.mutate({ taskId: task.id, assignee: nextAssignee });
                                }}
                                disabled={assigneeMutation.isPending}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                              >
                                {TEAM_MEMBERS.map((member) => (
                                  <option key={member} value={member}>
                                    {member}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(task)}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                              >
                                <Edit3 size={15} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMutation.mutate(task.id)}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </section>
          </div>
        </div>
      </div>

      <TaskForm
        isOpen={isFormOpen}
        mode={formMode}
        initialValues={formInitialValues}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        submitError={formError}
        onClose={() => {
          setIsFormOpen(false);
          setFormError(null);
        }}
        onSubmit={handleSubmitForm}
      />
    </main>
  );
}
