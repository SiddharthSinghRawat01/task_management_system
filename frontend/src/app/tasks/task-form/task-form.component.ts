import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent {
  @Input() task?: Task;
  @Output() formSubmit = new EventEmitter<Task>();

  taskForm: FormGroup;

 constructor(private fb: FormBuilder, private taskService: TaskService, private router: Router) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['in progress', Validators.required],
      dueDate: [null]
    });
  }

  ngOnChanges(changes: any) {
    if (this.task) {
      this.taskForm.patchValue(this.task);
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const task = this.taskForm.value;
      if (this.task && this.task._id) {
        this.taskService.updateTask(this.task._id, task).subscribe({
          next: (updatedTask) => {
            this.formSubmit.emit(updatedTask);
          },
          error: (err) => {
            console.error('Failed to update task', err);
          }
        });
      } else {
        this.taskService.createTask(task).subscribe({
          next: (task) => {
            this.formSubmit.emit(task);
            this.router.navigate(['/tasks']);
          },
          error: (err) => {
            console.error('Failed to create task', err);
          }
        });
      }
    }
  }
}
