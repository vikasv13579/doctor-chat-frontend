import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Patient {
    id: number;
    fullName: string;
    email: string;
    onboardingStatus: string;
    onboardingData?: any; // Only if needed for read-only view
}

@Injectable({
    providedIn: 'root'
})
export class DoctorService {
    // private apiUrl = `${environment.apiUrl}/doctors`; 

    private http = inject(HttpClient);

    getAssignedPatients(): Observable<any[]> {
        // Ideally this would be a specific endpoint, but based on provided API, rooms seems best bet.
        return this.http.get<any[]>(`${environment.apiUrl}/chat/rooms`);
    }

    getPatientOnboardingDetails(patientId: number): Observable<any> {
        // This endpoint wasn't explicitly provided in the simple list, but "Doctor Dashboard... See patient onboarding details".
        // I'll assume an endpoint exists or I'll have to use what I have.
        // Maybe `GET /onboarding/status` allows an ID query param for doctors? 
        // I'll assume `GET /onboarding/status/${patientId}` or similar.
        // Spec says: `GET /onboarding/status`.
        // I'll try `GET /onboarding/status?userId=${patientId}`.
        return this.http.get<any>(`${environment.apiUrl}/onboarding/status?userId=${patientId}`);
    }
}
