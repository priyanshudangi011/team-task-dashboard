import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTask, initialMockTasks, resetMockFailureMode, setMockFailureMode, updateTask } from './mock-api';
import type { Task } from '@/types/task';

const tasksQueryKey = ['tasks'] as const;

describe('mock API failure simulation', () => {
  beforeEach(() => {
    resetMockFailureMode();
  });

  it('rejects a create task request when the development failure mode is enabled', async () => {
    setMockFailureMode({
      enabled: true,
      operation: 'create',
      message: 'Simulated create failure for tests.',
    });

    await expect(
      createTask({
        title: 'Audit release timeline',
        description: 'Check the release timeline before the next milestone.',
        status: 'todo',
        priority: 'medium',
        assignee: 'Aarav Singh',
        dueDate: '2026-10-24',
      }),
    ).rejects.toThrow('Simulated create failure for tests.');
  });

  it('rejects an update request when the failure mode matches the mutation', async () => {
    setMockFailureMode({
      enabled: true,
      operation: 'update',
      message: 'Simulated update failure for tests.',
    });

    await expect(updateTask('task-1', { status: 'completed' })).rejects.toThrow(
      'Simulated update failure for tests.',
    );
  });
});

describe('optimistic cache behavior', () => {
  it('shows an optimistic update before the mutation resolves and keeps the successful state', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const previousTasks = [...initialMockTasks];
    queryClient.setQueryData<Task[]>(tasksQueryKey, previousTasks);

    queryClient.setQueryData<Task[]>(tasksQueryKey, (current = []) =>
      current.map((task) => (task.id === 'task-1' ? { ...task, status: 'completed' } : task)),
    );

    expect(queryClient.getQueryData<Task[]>(tasksQueryKey)?.find((task) => task.id === 'task-1')?.status).toBe(
      'completed',
    );

    queryClient.setQueryData<Task[]>(tasksQueryKey, previousTasks);
    expect(queryClient.getQueryData<Task[]>(tasksQueryKey)?.find((task) => task.id === 'task-1')?.status).toBe(
      'in_progress',
    );

    queryClient.setQueryData<Task[]>(tasksQueryKey, (current = []) =>
      current.map((task) => (task.id === 'task-1' ? { ...task, assignee: 'Maya Chen' } : task)),
    );

    expect(queryClient.getQueryData<Task[]>(tasksQueryKey)?.find((task) => task.id === 'task-1')?.assignee).toBe(
      'Maya Chen',
    );
  });

  it('restores the previous cache state after a failed update', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const previousTasks: Task[] = [...initialMockTasks];
    queryClient.setQueryData<Task[]>(tasksQueryKey, previousTasks);

    const optimisticState: Task[] = previousTasks.map((task) =>
      task.id === 'task-2' ? { ...task, priority: 'high' } : task,
    );

    queryClient.setQueryData<Task[]>(tasksQueryKey, optimisticState);
    expect(queryClient.getQueryData<Task[]>(tasksQueryKey)?.find((task) => task.id === 'task-2')?.priority).toBe(
      'high',
    );

    queryClient.setQueryData<Task[]>(tasksQueryKey, previousTasks);
    expect(queryClient.getQueryData<Task[]>(tasksQueryKey)?.find((task) => task.id === 'task-2')?.priority).toBe(
      'medium',
    );
  });
});
