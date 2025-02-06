import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from 'app/services/task.service';
import { Task } from '../models/task.model';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TaskFormComponent } from './task-form/task-form.component';
import { format } from 'date-fns-tz';

@Component({
  selector: 'app-task-list',
  standalone: true,
imports: [CommonModule, FormsModule, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  loading = true;
  error = '';
  selectedStatus: string = 'all';
  private taskCreatedSubscription: Subscription | undefined;
  private taskUpdatedSubscription: Subscription | undefined;
  private taskDeletedSubscription: Subscription | undefined;
  editingTask: Task | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) { }

  formatDueDate(dueDate: Date | undefined): string {
    if (!dueDate) {
      return 'No due date';
    }
    if (!(dueDate instanceof Date)) {
      return 'No due date';
    }
    return dueDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  }

  ngOnInit(): void {
    this.authService.checkAuthStatus();
    this.loadTasks();

    this.taskCreatedSubscription = this.taskService.taskCreated$.subscribe(
      (task: Task) => {
        this.tasks = [...this.tasks, task];
      }
    );

    this.taskUpdatedSubscription = this.taskService.taskUpdated$.subscribe(
      (task: Task) => {
        this.tasks = this.tasks.map((t) => (t._id === task._id ? task : t));
      }
    );

    this.taskDeletedSubscription = this.taskService.taskDeleted$.subscribe(
      (taskId: string) => {
        this.tasks = this.tasks.filter((task) => task._id !== taskId);
      }
    );
  }

  ngOnDestroy(): void {
    this.taskCreatedSubscription?.unsubscribe();
    this.taskUpdatedSubscription?.unsubscribe();
    this.taskDeletedSubscription?.unsubscribe();
  }

  loadTasks(): void {
    this.loadTasksByStatus(this.selectedStatus);
  }

  loadTasksByStatus(status: string): void {
    this.loading = true;
    this.selectedStatus = status;
    this.taskService.getTasksByStatus(status).subscribe({
      next: (tasks: Task[]) => {
        console.log('Tasks received:', tasks);
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading tasks:', err);
        this.error = 'Failed to load tasks';
        this.loading = false;
      },
    });
  }

  deleteTask(id: string | undefined): void {
    if (!id) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task._id !== id);
      },
      error: (err: any) => {
        this.error = 'Failed to delete task';
      },
    });
  }

  updateTaskStatus(task: Task): void {
    this.taskService.updateTask(task._id || '', task).subscribe({
      next: (updatedTask: Task) => {
        this.tasks = this.tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t));
      },
      error: (err: any) => {
        this.error = 'Failed to update task status';
      },
    });
  }

  editTask(task: Task): void {
    this.editingTask = task;
  }

  cancelEdit(): void {
    this.editingTask = null;
  }

  updateTask(task: Task): void {
    this.taskService.updateTask(task._id || '', task).subscribe({
      next: (updatedTask: Task) => {
        this.tasks = this.tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t));
        this.cancelEdit();
      },
      error: (err: any) => {
        this.error = 'Failed to update task';
        
      },
    });
  }
}
