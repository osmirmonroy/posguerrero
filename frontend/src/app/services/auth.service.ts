import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl.replace('/api', '') + '/auth';
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    constructor(private http: HttpClient, private router: Router) {
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials)
            .pipe(tap(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            }));
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        const user = this.currentUserValue;
        return user && user.token;
    }

    hasRole(role: string): boolean {
        const user = this.currentUserValue;
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        return user.role === role;
    }

    refreshToken(): Observable<any> {
        const user = this.currentUserValue;
        const refreshToken = user?.refreshToken;
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token'));
        }
        return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken })
            .pipe(tap(response => {
                // Update current user with new token
                const currentUser = { ...this.currentUserValue, token: response.accessToken, refreshToken: response.refreshToken };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                this.currentUserSubject.next(currentUser);
            }));
    }
}
