import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'onboarding',
        loadComponent: () => import('./onboarding/onboarding-container/onboarding-container.component').then(m => m.OnboardingContainerComponent),
        canActivate: [authGuard, roleGuard('patient')]
    },
    {
        path: 'patient-dashboard',
        loadComponent: () => import('./dashboard/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent),
        canActivate: [authGuard, roleGuard('patient')]
    },
    {
        path: 'doctor-dashboard',
        loadComponent: () => import('./dashboard/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent),
        canActivate: [authGuard, roleGuard('doctor')]
    },
    {
        path: 'chat',
        loadComponent: () => import('./chat/chat-window/chat-window.component').then(m => m.ChatWindowComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chat/:roomId',
        loadComponent: () => import('./chat/chat-window/chat-window.component').then(m => m.ChatWindowComponent),
        canActivate: [authGuard]
    },
    // Catch all
    { path: '**', redirectTo: 'login' }
];
