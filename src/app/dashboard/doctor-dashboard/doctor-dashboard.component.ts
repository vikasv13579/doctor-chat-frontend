import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../doctor.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-doctor-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-container">
      <header>
        <h1>Doctor Dashboard</h1>
        <button (click)="logout()" class="logout-btn">Logout</button>
      </header>

      <div class="main-content">
        <div class="patient-list">
          <h3>Assigned Patients</h3>
          <div *ngIf="loading" class="loading">Loading patients...</div>
          <div *ngIf="!loading && patients().length === 0" class="empty">No patients assigned yet.</div>

          <div 
            *ngFor="let patient of patients()" 
            class="patient-card" 
            [class.selected]="selectedPatient()?.id === patient.id"
            (click)="selectPatient(patient)"
          >
            <div class="avatar">{{ patient.fullName?.charAt(0) || 'P' }}</div>
            <div class="info">
              <h4>{{ patient.fullName || 'Unknown' }}</h4>
              <p>{{ patient.email }}</p>
            </div>
          </div>
        </div>

        <div class="patient-details" *ngIf="selectedPatient(); else noSelection">
          <div class="details-header">
            <h2>{{ selectedPatient().fullName }}</h2>
            <button class="chat-btn" (click)="startChat(selectedPatient())">Message Patient</button>
          </div>

          <div class="details-body" *ngIf="onboardingDetails()">
             <h4>Onboarding Information</h4>
             <div class="detail-section">
               <h5>Medical History</h5>
               <p><strong>Allergies:</strong> {{ onboardingDetails().data?.allergies || 'N/A' }}</p>
               <p><strong>Medications:</strong> {{ onboardingDetails().data?.medications || 'N/A' }}</p>
             </div>
             
             <div class="detail-section">
               <h5>Insurance</h5>
               <p><strong>Provider:</strong> {{ onboardingDetails().data?.insurance_provider || 'N/A' }}</p>
             </div>
          </div>
          <div *ngIf="!onboardingDetails()" class="loading">Loading details...</div>
        </div>

        <ng-template #noSelection>
          <div class="patient-details empty-state">
            <p>Select a patient to view details</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
    styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 20px; height: 90vh; display: flex; flex-direction: column; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .logout-btn { background: transparent; border: 1px solid #cbd5e0; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    
    .main-content { display: grid; grid-template-columns: 350px 1fr; gap: 20px; flex: 1; overflow: hidden; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    
    .patient-list { border-right: 1px solid #e2e8f0; padding: 20px; overflow-y: auto; background: #f8fbff; }
    .patient-list h3 { margin-top: 0; color: #4a5568; font-size: 1.1rem; margin-bottom: 15px; }
    
    .patient-card { display: flex; align-items: center; padding: 15px; border-radius: 10px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; background: white; border: 1px solid #edf2f7; }
    .patient-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .patient-card.selected { border-color: #4299e1; background: #ebf8ff; }
    
    .avatar { width: 40px; height: 40px; background: #4299e1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; }
    .info h4 { margin: 0; font-size: 0.95rem; color: #2d3748; }
    .info p { margin: 2px 0 0; font-size: 0.8rem; color: #718096; }
    
    .patient-details { padding: 30px; overflow-y: auto; }
    .details-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
    .chat-btn { background: #48bb78; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; }
    
    .detail-section { margin-bottom: 25px; padding: 15px; background: #f7fafc; border-radius: 8px; }
    .detail-section h5 { margin-top: 0; margin-bottom: 10px; color: #4a5568; }
    
    .empty-state { display: flex; align-items: center; justify-content: center; color: #a0aec0; height: 100%; }
  `]
})
export class DoctorDashboardComponent implements OnInit {
    doctorService = inject(DoctorService);
    router = inject(Router);

    patients = signal<any[]>([]);
    selectedPatient = signal<any>(null);
    onboardingDetails = signal<any>(null);
    loading = true;

    ngOnInit() {
        this.loadPatients();
    }

    loadPatients() {
        this.doctorService.getAssignedPatients().subscribe({
            next: (data) => {
                // Data likely is an array of rooms. Transforming to patients list.
                // Assuming room.users or room.otherUser
                // Since we don't have exact API response, I'll assume standard chat room structure or adapting.
                // If API returns Rooms[]: { id, participants: [User, User] }
                // I'll map it.
                // For prototype, let's assume the API returns the list of PATIENTS directly as user objects if using a specific "patients" endpoint,
                // OR we adapt the rooms.
                this.patients.set(data);
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    selectPatient(patient: any) {
        this.selectedPatient.set(patient);
        this.onboardingDetails.set(null);

        // Fetch details
        // If patient object has ID
        if (patient.id) {
            this.doctorService.getPatientOnboardingDetails(patient.id).subscribe(details => {
                this.onboardingDetails.set(details);
            });
        }
    }

    startChat(patient: any) {
        // Navigate to chat route or open chat modal
        // We'll assume a chat route for now, passing room ID or patient ID
        // If we have a roomId from the patient/room object:
        if (patient.roomId) {
            this.router.navigate(['/chat', patient.roomId]);
        } else {
            // Create room logic would go here
            this.router.navigate(['/chat']); // generic chat
        }
    }

    logout() {
        localStorage.removeItem('docket_token');
        this.router.navigate(['/login']);
    }
}
