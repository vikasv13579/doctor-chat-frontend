import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
    id: number;
    email: string;
    role: 'patient' | 'doctor';
    fullName?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private http = inject(HttpClient);
    private router = inject(Router);

    // Signal for current user to easily use in components
    currentUser = signal<User | null>(null);

    // Track if auth has tried to load from storage
    private initialized = new BehaviorSubject<boolean>(false);

    // Also keep token in memory
    private tokenKey = 'docket_token';

    constructor() {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        const token = localStorage.getItem(this.tokenKey);
        if (token) {
            // In a real app we might validate token or fetch /me immediately
            // For now, we optionally fetch /me to ensure validity or decode token
            this.getMe().subscribe({
                next: () => this.initialized.next(true),
                error: () => {
                    this.logout();
                    this.initialized.next(true);
                }
            });
        } else {
            this.initialized.next(true);
        }
    }

    // Guard helper
    ensureUserLoaded(): Observable<boolean> {
        return this.initialized.asObservable();
    }

    register(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap(res => this.handleAuthSuccess(res))
        );
    }

    login(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
            tap(res => this.handleAuthSuccess(res))
        );
    }

    getMe(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`).pipe(
            tap(user => this.currentUser.set(user))
        );
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private handleAuthSuccess(res: AuthResponse) {
        localStorage.setItem(this.tokenKey, res.token);
        this.currentUser.set(res.user);
    }
}
