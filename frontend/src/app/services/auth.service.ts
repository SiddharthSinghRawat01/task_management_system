import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface RegisterResponse {
  message: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private authToken: string | null = null;

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.checkAuthStatus();
  }

  private getStorage(): Storage | { 
    getItem: (key: string) => string | null,
    setItem: (key: string, value: string) => void,
    removeItem: (key: string) => void 
  } {
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage;
    }
    return {
      getItem: (key: string) => this.authToken,
      setItem: (key: string, value: string) => this.authToken = value,
      removeItem: (key: string) => this.authToken = null
    };
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  checkAuthStatus(): void {
    const token = this.getStorage().getItem('authToken');
    this.isAuthenticatedSubject.next(!!token);
  }

  login(token: string): void {
    this.getStorage().setItem('authToken', token);
    this.isAuthenticatedSubject.next(true);
    this.router.navigate(['/tasks']);
  }

  logout(): void {
    this.getStorage().removeItem('authToken');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.getStorage().getItem('authToken');
  }

  authenticate(email: string, password: string): Observable<{token: string}> {
    return this.http.post<{token: string}>('http://localhost:5000/api/auth/login', { email, password });
  }

  register(username: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('http://localhost:5000/api/auth/register', {
      username,
      email,
      password
    }).pipe(
      tap(response => {
        if (response.token) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
