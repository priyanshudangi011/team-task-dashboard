import { TaskDraft } from '@/types/task';

export type TaskFormErrors = Partial<Record<'title' | 'description' | 'status' | 'priority' | 'assignee' | 'dueDate', string>>;

export const validateTaskForm = (draft: TaskDraft): TaskFormErrors => {
  const errors: TaskFormErrors = {};

  if (!draft.title || draft.title.trim().length === 0) {
    errors.title = 'Title is required.';
  } else if (draft.title.trim().length > 80) {
    errors.title = 'Title must be 80 characters or fewer.';
  }

  if (draft.description && draft.description.trim().length > 300) {
    errors.description = 'Description must be 300 characters or fewer.';
  }

  if (!draft.status || !['todo', 'in_progress', 'completed'].includes(draft.status)) {
    errors.status = 'Select a valid status.';
  }

  if (!draft.priority || !['low', 'medium', 'high'].includes(draft.priority)) {
    errors.priority = 'Select a valid priority.';
  }

  if (!draft.assignee || draft.assignee.trim().length === 0) {
    errors.assignee = 'Assignee is required.';
  }

  if (!draft.dueDate || Number.isNaN(new Date(draft.dueDate).getTime())) {
    errors.dueDate = 'Due date must be valid.';
  }

  return errors;
};
