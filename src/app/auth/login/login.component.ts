import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  loginData = { login: '', password: '' };
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.login(
      this.loginData.login,
      this.loginData.password
    ).subscribe({
      next: () => {
        this.router.navigate(['/']); // Navigate to a protected route on success
      },
      error: (err) => {
        console.error('Login failed in component:', err);
        this.error = err.message; 
      }
    });
  }
}
