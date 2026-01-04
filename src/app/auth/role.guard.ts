import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const roleGuard = (requiredRole: 'patient' | 'doctor'): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        // Wait for initializing to finish
        // We filter for true meaning "finished loading". 
        // Note: initialized emits true when done (either success or fail).
        return authService.ensureUserLoaded().pipe(
            filter(loaded => loaded),
            take(1),
            map(() => {
                const currentUser = authService.currentUser();

                if (!authService.isAuthenticated()) {
                    return router.createUrlTree(['/login']);
                }

                if (currentUser?.role === requiredRole) {
                    return true;
                }

                // Redirect to appropriate dashboard if role mismatch
                if (currentUser?.role === 'patient') {
                    return router.createUrlTree(['/patient-dashboard']);
                } else if (currentUser?.role === 'doctor') {
                    return router.createUrlTree(['/doctor-dashboard']);
                }

                return router.createUrlTree(['/login']);
            })
        );
    };
};
