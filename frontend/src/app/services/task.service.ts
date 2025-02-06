import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Task } from '../models/task.model';
import { AuthService } from './auth.service';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class TaskService implements OnDestroy {
  private apiUrl = 'http://localhost:5000/api/tasks';
  public socket;
  private taskCreatedSubject = new Subject<Task>();
  private taskUpdatedSubject = new Subject<Task>();
  private taskDeletedSubject = new Subject<string>();

  taskCreated$ = this.taskCreatedSubject.asObservable();
  taskUpdated$ = this.taskUpdatedSubject.asObservable();
  taskDeleted$ = this.taskDeletedSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.socket = io('http://localhost:5000'); // Connect to the WebSocket server

    this.socket.on('taskCreated', (task: Task) => {
      this.taskCreatedSubject.next(task);
    });

    this.socket.on('taskUpdated', (data: { task: Task; user: string }) => {
      this.taskUpdatedSubject.next(data.task);
    });

    this.socket.on('taskDeleted', (taskId: string) => {
      this.taskDeletedSubject.next(taskId);
    });
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task, { headers: this.getHeaders() });
  }

  updateTask(id: string, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task, { headers: this.getHeaders() });
  }

  getTasksByStatus(status: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/status/${status}`, { headers: this.getHeaders() });
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
