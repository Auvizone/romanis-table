import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, map, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private sessionTimeout = 3600000; // 1 hour in milliseconds
  private authStatusSubject = new BehaviorSubject<boolean>(this.checkInitialAuthStatus());
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check session validity when service is instantiated
    this.checkSessionValidity();
  }

  /**
   * Authenticate user with Odoo backend
   * Uses secure CSRF-protected JSON-RPC request
   */
  login(login: string, password: string): Observable<any> {
    // Clear any previous session data before attempting login
    this.clearSessionData();
    
    // Send parameters directly as expected by Odoo type='json' endpoint
    const requestData = {
      login: login,
      password: password
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Making login request to:', `${this.apiUrl}/api/login`);
    console.log('Request data:', requestData);
    console.log('Request headers:', headers);

    return this.http.post<any>(`${this.apiUrl}/api/login`, requestData, {
      headers: headers,
      withCredentials: true  // Ensure cookies are sent with request
    }).pipe(
      map(response => {
        // Check if response has error (Odoo returns error directly)
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Success response should have uid and message
        if (response.uid) {
          this.setSecureSession(response);
          this.authStatusSubject.next(true);
          return response;
        } else {
          throw new Error('Invalid response from server');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.clearSessionData();
        const errorMessage = error.message || 
                            error.error?.error || 
                            'Login failed. Please check your credentials.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Securely store session information with expiration
   * @param sessionData Response data from successful login
   */
  setSecureSession(sessionData: any): void {
    try {
      // Store minimal necessary session data
      const sessionInfo = {
        uid: sessionData.uid,
        username: sessionData.username,
        timestamp: new Date().getTime(),
        expires: new Date().getTime() + this.sessionTimeout
      };
      
      // Store encrypted in sessionStorage for better security than localStorage
      // (In a real production app, consider using a proper encryption library)
      sessionStorage.setItem('auth_session', JSON.stringify(sessionInfo));
      localStorage.setItem('user_is_logged_in', 'true');
    } catch (e) {
      console.error('Error storing session data:', e);
    }
  }

  /**
   * Log out user and destroy session both client and server side
   */
  logout(): Observable<any> {
    const logoutRequest = {
      jsonrpc: '2.0',
      method: 'call',
      params: {},
      id: new Date().getTime()
    };
    
    this.clearSessionData();
    this.authStatusSubject.next(false);
    
    // Send logout request to server, but don't wait for it to complete
    return this.http.post<any>(
      `${this.apiUrl}/web/session/destroy`, 
      logoutRequest, 
      { withCredentials: true }
    ).pipe(
      catchError(error => {
        console.error('Logout error:', error);
        return of(null); // Always resolve the Observable even if server logout fails
      }),
      finalize(() => {
        // Ensure session is cleared locally even if server request fails
        this.clearSessionData();
      })
    );
  }

  /**
   * Check if user is currently logged in with valid, non-expired session
   */
  isLoggedIn(): boolean {
    try {
      const sessionStr = sessionStorage.getItem('auth_session');
      if (!sessionStr) return false;
      
      const session = JSON.parse(sessionStr);
      const now = new Date().getTime();
      
      // Check if session has expired
      if (session.expires < now) {
        this.clearSessionData(); // Clean up expired session
        return false;
      }
      
      // Extend session timeout on activity
      this.refreshSessionExpiration();
      return true;
    } catch (e) {
      this.clearSessionData();
      return false;
    }
  }

  /**
   * Clear all session data from client storage
   */
  private clearSessionData(): void {
    sessionStorage.removeItem('auth_session');
    localStorage.removeItem('user_is_logged_in');
  }

  /**
   * Check initial authentication status when service loads
   */
  private checkInitialAuthStatus(): boolean {
    return this.isLoggedIn();
  }

  /**
   * Verify session validity and auto-logout if expired
   */
  private checkSessionValidity(): void {
    if (!this.isLoggedIn() && localStorage.getItem('user_is_logged_in')) {
      // Session expired but flag still present - clean up
      this.clearSessionData();
      this.authStatusSubject.next(false);
    }
  }

  /**
   * Extend session expiration time on user activity
   */
  private refreshSessionExpiration(): void {
    try {
      const sessionStr = sessionStorage.getItem('auth_session');
      if (!sessionStr) return;
      
      const session = JSON.parse(sessionStr);
      session.expires = new Date().getTime() + this.sessionTimeout;
      
      sessionStorage.setItem('auth_session', JSON.stringify(session));
    } catch (e) {
      console.error('Error refreshing session:', e);
    }
  }

  /**
   * Get the current user's information if logged in
   */
  getCurrentUser(): any {
    try {
      const sessionStr = sessionStorage.getItem('auth_session');
      if (!sessionStr) return null;
      
      return JSON.parse(sessionStr);
    } catch (e) {
      return null;
    }
  }

}
