import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(params: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        login: params.login,
        password: params.password
      }
    };

    return this.http.post<any>(`${environment.apiUrl}/api/login`, body, { headers, withCredentials: true }).pipe(
      tap(response => {
        console.log("🚀 ~ file: auth.service.ts:24 ~ response:", response)
        // A successful response has a 'result' object that does NOT contain an 'error' key.
        if (response && response.result && !response.result.error) {
          localStorage.setItem('user_is_logged_in', 'true');
        } else {
          // If there is an error, it might be in response.result.error or response.error
          localStorage.removeItem('user_is_logged_in');
          const serverError = response?.result?.error || response?.error?.data?.message || 'Login failed: Invalid response from server.';
          throw new Error(serverError);
        }
      }),
      catchError(error => {
        console.error('AuthService login error:', error); // Detailed log
        localStorage.removeItem('user_is_logged_in');
        // The error might be thrown from the tap operator or be an HttpErrorResponse
        const errorMessage = error.message || error.error?.error || 'Login failed. Please check your credentials and ensure the Odoo server is accessible.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      jsonrpc: '2.0',
      method: 'call',
      params: {},
    };
    localStorage.removeItem('user_is_logged_in');
    return this.http.post<any>(`${environment.apiUrl}/web/session/destroy`, body, { headers, withCredentials: true });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user_is_logged_in');
  }
}
