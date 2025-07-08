import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Matrice Tarifaire';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to auth status changes if needed
    this.authService.authStatus$.subscribe(isLoggedIn => {
      // You can respond to login/logout events here if needed
      console.log('Auth status changed:', isLoggedIn);
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
        // Still navigate to login even if server logout fails
        this.router.navigate(['/login']);
      }
    });
  }
}
