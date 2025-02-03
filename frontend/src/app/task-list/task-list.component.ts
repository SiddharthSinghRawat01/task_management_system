import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent {
  tasks: Task[] = [];
  loading = true;
  error = '';

  constructor(private taskService: TaskService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus();
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks';
        this.loading = false;
      }
    });
  }

  deleteTask(id: string | undefined): void {
    if (!id) return;
    
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(task => task._id !== id);
      },
      error: (err) => {
        this.error = 'Failed to delete task';
      }
    });
  }
}
