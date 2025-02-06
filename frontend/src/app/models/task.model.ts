export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'in progress';
  createdAt?: Date;
  updatedAt?: Date;
  user?: string;
  dueDate?: Date;
}
