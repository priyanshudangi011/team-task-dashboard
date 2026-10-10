import { Task, TaskPriority, TaskStatus } from '@/types/task';

export type SortMode = 'dueDate' | 'title' | 'priority';
export type SortDirection = 'asc' | 'desc';
export type StatusFilter = 'all' | TaskStatus;
export type PriorityFilter = 'all' | TaskPriority;

export const TEAM_MEMBERS = ['Aarav Singh', 'Priya Nair', 'Daniel Kim', 'Maya Chen', 'Lucas Brown'];

export const DEFAULT_PAGE_SIZE = 6;

export const createTaskId = () => `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const normalizeText = (value: string) => value.trim().toLowerCase();

export const getTaskSummary = (tasks: Task[]) => ({
  total: tasks.length,
  completed: tasks.filter((task) => task.status === 'completed').length,
  inProgress: tasks.filter((task) => task.status === 'in_progress').length,
  todo: tasks.filter((task) => task.status === 'todo').length,
  overdue: tasks.filter((task) => {
    if (task.status === 'completed') return false;
    return new Date(task.dueDate).getTime() < Date.now();
  }).length,
});

export const filterTasks = (
  tasks: Task[],
  filters: {
    search?: string;
    status?: StatusFilter;
    priority?: PriorityFilter;
    assignee?: string;
  },
) => {
  const query = normalizeText(filters.search ?? '');
  const status = filters.status ?? 'all';
  const priority = filters.priority ?? 'all';
  const assignee = filters.assignee ?? 'all';

  return tasks.filter((task) => {
    const matchesSearch =
      query.length === 0 ||
      normalizeText(task.title).includes(query) ||
      normalizeText(task.description).includes(query);

    const matchesStatus = status === 'all' || task.status === status;
    const matchesPriority = priority === 'all' || task.priority === priority;
    const matchesAssignee = assignee === 'all' || task.assignee === assignee;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });
};

export const sortTasks = (tasks: Task[], sortMode: SortMode, direction: SortDirection) => {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    let comparison = 0;

    if (sortMode === 'title') {
      comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    }

    if (sortMode === 'dueDate') {
      comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    if (sortMode === 'priority') {
      const priorityOrder: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    return direction === 'asc' ? comparison : comparison * -1;
  });

  return sorted;
};

export const paginateTasks = (tasks: Task[], page: number, pageSize = DEFAULT_PAGE_SIZE) => {
  const totalItems = tasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    totalItems,
    totalPages,
    page: safePage,
    items: tasks.slice(startIndex, endIndex),
  };
};
