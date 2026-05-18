import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environment/environment';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

export interface UserDTO {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
  enabled: boolean;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string | null;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string | null>(this.getUsernameFromToken());
  username$ = this.usernameSubject.asObservable();

  constructor(private http: HttpClient) { }

  register(data: RegisterRequest): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest, rememberMe: boolean): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, data).pipe(
      tap((response) => {
        if (response.token) {
          const storage = rememberMe ? localStorage : sessionStorage;

          localStorage.removeItem('token');
          sessionStorage.removeItem('token');

          storage.setItem('token', response.token);

          this.loggedInSubject.next(true);
          this.usernameSubject.next(this.getUsernameFromToken());
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    this.loggedInSubject.next(false);
    this.usernameSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private getUsernameFromToken(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || null;
    } catch {
      return null;
    }
  }
}