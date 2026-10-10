import { Task, TaskDraft, TaskPriority, TaskStatus } from '@/types/task';

const STORAGE_KEY = 'team-task-dashboard-mock-data';

export const TEAM_MEMBERS = ['Aarav Singh', 'Priya Nair', 'Daniel Kim', 'Maya Chen', 'Lucas Brown'];

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const initialMockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Refresh onboarding checklist',
    description: 'Update the onboarding checklist for the new product launch and share it with the design team.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Priya Nair',
    dueDate: addDays(2),
    createdAt: addDays(-6),
  },
  {
    id: 'task-2',
    title: 'Build sprint retrospective notes',
    description: 'Summarize key wins, blockers, and action items from the last sprint for the leadership review.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Daniel Kim',
    dueDate: addDays(5),
    createdAt: addDays(-10),
  },
  {
    id: 'task-3',
    title: 'Prepare release QA checklist',
    description: 'Confirm device coverage, regression focus, and sign-off timeline for the upcoming mobile release.',
    status: 'completed',
    priority: 'high',
    assignee: 'Maya Chen',
    dueDate: addDays(-2),
    createdAt: addDays(-13),
  },
  {
    id: 'task-4',
    title: 'Review vendor contract renewal',
    description: 'Compare SLA, support coverage, and cost changes before the contract deadline.',
    status: 'todo',
    priority: 'low',
    assignee: 'Lucas Brown',
    dueDate: addDays(8),
    createdAt: addDays(-4),
  },
  {
    id: 'task-5',
    title: 'Polish dashboard analytics cards',
    description: 'Improve the card layout, spacing, and empty states for the weekly reporting dashboard.',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Aarav Singh',
    dueDate: addDays(1),
    createdAt: addDays(-8),
  },
  {
    id: 'task-6',
    title: 'Customer feedback summary',
    description: 'Group recurring issues, highlight top themes, and draft a response plan for the support team.',
    status: 'completed',
    priority: 'low',
    assignee: 'Priya Nair',
    dueDate: addDays(-5),
    createdAt: addDays(-15),
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readStoredTasks = (): Task[] => {
  if (typeof window === 'undefined') {
    return initialMockTasks;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return initialMockTasks;
    }

    const parsed = JSON.parse(saved) as Task[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMockTasks;
  } catch {
    return initialMockTasks;
  }
};

const writeStoredTasks = (tasks: Task[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Intentionally ignore storage failures in the mock environment.
  }
};

export const fetchTasks = async (): Promise<Task[]> => {
  await wait(350);
  return readStoredTasks();
};

export const createTask = async (draft: TaskDraft): Promise<Task> => {
  await wait(500);
  const nextTask: Task = {
    id: draft.id || `task-${Date.now()}`,
    title: draft.title.trim(),
    description: draft.description.trim(),
    status: draft.status,
    priority: draft.priority,
    assignee: draft.assignee,
    dueDate: draft.dueDate,
    createdAt: draft.createdAt || new Date().toISOString().slice(0, 10),
  };

  const tasks = readStoredTasks();
  const nextTasks = [nextTask, ...tasks];
  writeStoredTasks(nextTasks);
  return nextTask;
};

export const updateTask = async (taskId: string, changes: Partial<TaskDraft>): Promise<Task> => {
  await wait(450);
  const tasks = readStoredTasks();
  const index = tasks.findIndex((task) => task.id === taskId);

  if (index === -1) {
    throw new Error('Task not found.');
  }

  const nextTask = { ...tasks[index], ...changes } as Task;
  tasks[index] = nextTask;
  writeStoredTasks(tasks);
  return nextTask;
};

export const deleteTask = async (taskId: string): Promise<string> => {
  await wait(350);
  const tasks = readStoredTasks();
  const filtered = tasks.filter((task) => task.id !== taskId);

  if (filtered.length === tasks.length) {
    throw new Error('Unable to delete the selected task.');
  }

  writeStoredTasks(filtered);
  return taskId;
};

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus,
): Promise<Task> => {
  await wait(350);
  return updateTask(taskId, { status });
};

export const assignTask = async (taskId: string, assignee: string): Promise<Task> => {
  await wait(300);
  return updateTask(taskId, { assignee });
};

export const isTaskPriority = (value: string): value is TaskPriority =>
  ['low', 'medium', 'high'].includes(value);

export const isTaskStatus = (value: string): value is TaskStatus =>
  ['todo', 'in_progress', 'completed'].includes(value);
