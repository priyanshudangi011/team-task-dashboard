import { describe, expect, it } from 'vitest';
import { filterTasks, paginateTasks, sortTasks } from './task-utils';
import { Task } from '@/types/task';

const tasks: Task[] = [
  {
    id: '1',
    title: 'Alpha launch',
    description: 'Ship the onboarding flow for users.',
    status: 'todo',
    priority: 'high',
    assignee: 'Priya Nair',
    dueDate: '2026-10-15',
    createdAt: '2026-10-01',
  },
  {
    id: '2',
    title: 'Beta cleanup',
    description: 'Fix queue reports for the team.',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Daniel Kim',
    dueDate: '2026-10-08',
    createdAt: '2026-10-02',
  },
  {
    id: '3',
    title: 'Gamma build',
    description: 'Finish the project planning summary.',
    status: 'completed',
    priority: 'low',
    assignee: 'Priya Nair',
    dueDate: '2026-10-12',
    createdAt: '2026-10-03',
  },
];

describe('filterTasks', () => {
  it('searches by title', () => {
    const result = filterTasks(tasks, { search: 'alpha' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('searches by description', () => {
    const result = filterTasks(tasks, { search: 'queue' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by status', () => {
    const result = filterTasks(tasks, { status: 'completed' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('combines multiple filters', () => {
    const result = filterTasks(tasks, {
      search: 'team',
      status: 'in_progress',
      priority: 'medium',
      assignee: 'Daniel Kim',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('sortTasks and paginateTasks', () => {
  it('sorts by due date ascending', () => {
    const sorted = sortTasks(tasks, 'dueDate', 'asc');
    expect(sorted.map((task) => task.id)).toEqual(['2', '3', '1']);
  });

  it('returns correct page contents', () => {
    const result = paginateTasks(tasks, 2, 2);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('3');
  });

  it('handles empty results', () => {
    const result = paginateTasks([], 1, 2);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(0);
  });
});
