import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OnboardingStatus {
    status: 'draft' | 'submitted' | 'new';
    current_step: number;
    data: any;
}

@Injectable({
    providedIn: 'root'
})
export class OnboardingService {
    private apiUrl = `${environment.apiUrl}/onboarding`;
    private http = inject(HttpClient);

    // Signal to hold current onboarding state
    currentStep = signal<number>(1);
    onboardingData = signal<any>({});

    getStatus(): Observable<OnboardingStatus> {
        console.log('OnboardingService: getStatus called', `${this.apiUrl}/status`);
        return this.http.get<OnboardingStatus>(`${this.apiUrl}/status`).pipe(
            tap({
                next: (res: OnboardingStatus) => console.log('OnboardingService: getStatus success', res),
                error: (err: any) => console.error('OnboardingService: getStatus error', err)
            })
        );
    }

    saveDraft(step: number, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/draft`, {
            currentStep: step,
            stepData: data
        });
    }

    submitForm(): Observable<any> {
        return this.http.post(`${this.apiUrl}/submit`, {});
    }
}
