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
        db: environment.odooDb,
        login: params.login,
        password: params.password,
        context: {}
      }
    };

    return this.http.post<any>(`${environment.apiUrl}/web/session/authenticate`, body, { headers, withCredentials: true }).pipe(
      tap(response => {
        if (response.result) {
          localStorage.setItem('user_is_logged_in', 'true');
        } else if (response.error) {
          localStorage.removeItem('user_is_logged_in');
          throw new Error(response.error.data.message);
        }
      }),
      catchError(error => {
        localStorage.removeItem('user_is_logged_in');
        return throwError(() => new Error('Login failed. Please check your credentials and ensure the Odoo server is accessible.'));
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
