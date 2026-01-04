import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    router = inject(Router);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    error = '';
    loading = false;

    onSubmit() {
        if (this.loginForm.invalid) return;

        this.loading = true;
        this.error = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
                // Redirect based on role
                if (res.user.role === 'doctor') {
                    this.router.navigate(['/doctor-dashboard']);
                } else {
                    this.router.navigate(['/patient-dashboard']);
                }
            },
            error: (err) => {
                this.error = err.error?.message || 'Login failed. Please try again.';
                this.loading = false;
            }
        });
    }
}
