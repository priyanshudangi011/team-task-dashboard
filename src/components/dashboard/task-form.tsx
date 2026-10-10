'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { TEAM_MEMBERS } from '@/lib/task-utils';
import { TaskDraft } from '@/types/task';
import { TaskFormErrors, validateTaskForm } from '@/lib/validation';

export interface TaskFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialValues: TaskDraft;
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

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

export function TaskForm({ isOpen, mode, initialValues, onClose, onSubmit, isSubmitting, submitError }: TaskFormProps) {
  const [draft, setDraft] = useState<TaskDraft>(initialValues ?? emptyDraft);
  const [errors, setErrors] = useState<TaskFormErrors>({});

  useEffect(() => {
    setDraft(initialValues ?? emptyDraft);
    setErrors({});
  }, [initialValues, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateTaskForm(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(draft);
  };

  const handleChange = <K extends keyof TaskDraft>(field: K, value: TaskDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Task</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {mode === 'create' ? 'Create task' : 'Edit task'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close task form"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Title</span>
              <input
                value={draft.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                placeholder="e.g. Finalize sprint plan"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'task-title-error' : undefined}
              />
              {errors.title ? <span id="task-title-error" className="text-sm text-red-600">{errors.title}</span> : null}
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
              <textarea
                value={draft.description}
                onChange={(event) => handleChange('description', event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                placeholder="Briefly describe the task"
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description ? <span className="text-sm text-red-600">{errors.description}</span> : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</span>
              <select
                value={draft.status}
                onChange={(event) => handleChange('status', event.target.value as TaskDraft['status'])}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                aria-invalid={Boolean(errors.status)}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status ? <span className="text-sm text-red-600">{errors.status}</span> : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Priority</span>
              <select
                value={draft.priority}
                onChange={(event) => handleChange('priority', event.target.value as TaskDraft['priority'])}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                aria-invalid={Boolean(errors.priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.priority ? <span className="text-sm text-red-600">{errors.priority}</span> : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Assignee</span>
              <select
                value={draft.assignee}
                onChange={(event) => handleChange('assignee', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                aria-invalid={Boolean(errors.assignee)}
              >
                <option value="">Select a team member</option>
                {TEAM_MEMBERS.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              {errors.assignee ? <span className="text-sm text-red-600">{errors.assignee}</span> : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Due date</span>
              <input
                type="date"
                value={draft.dueDate}
                onChange={(event) => handleChange('dueDate', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                aria-invalid={Boolean(errors.dueDate)}
              />
              {errors.dueDate ? <span className="text-sm text-red-600">{errors.dueDate}</span> : null}
            </label>
          </div>

          {submitError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {submitError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create task' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
