import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: '../login/login.component.css' // Reusing login styles for consistency
})
export class RegisterComponent {
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    router = inject(Router);

    registerForm = this.fb.group({
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        role: ['patient', [Validators.required]] // Default to patient
    });

    error = '';
    loading = false;

    onSubmit() {
        if (this.registerForm.invalid) return;

        this.loading = true;
        this.error = '';

        this.authService.register(this.registerForm.value).subscribe({
            next: (res) => {
                // User requested to go to login page after registration
                this.loading = false;
                alert('Registration successful! Please login.');
                this.authService.logout(); // Clear the auto-set token
                // router navigate is handled in logout() but let's be explicit if needed, 
                // though logout() already redirects to /login.
            },
            error: (err) => {
                this.error = err.error?.message || 'Registration failed. Please try again.';
                this.loading = false;
            }
        });
    }
}
