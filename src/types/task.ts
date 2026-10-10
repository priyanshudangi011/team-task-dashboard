export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  createdAt: string;
}

export type TaskDraft = Omit<Task, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};
