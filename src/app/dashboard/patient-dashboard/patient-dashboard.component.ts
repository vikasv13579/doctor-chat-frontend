import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingService } from '../../onboarding/onboarding.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header>
        <h1>My Health Dashboard</h1>
        <div class="header-actions">
           <a class="nav-link" *ngIf="onboardingStatus() === 'submitted'" (click)="openChat()">Messages</a>
           <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </header>

      <div class="content-area">
        <!-- Loading State -->
        <div *ngIf="loading()" class="loading">Loading dashboard...</div>

        <!-- Onboarding Status Card -->
        <div class="card status-card" *ngIf="!loading() && onboardingStatus() === 'draft'">
          <div class="status-content">
            <h3>Complete Your Profile</h3>
            <p>You have not finished your onboarding yet.</p>
            <button class="action-btn" (click)="continueOnboarding()">Continue Onboarding</button>
          </div>
        </div>

        <!-- Doctor Info Card -->
        <div class="card doctor-card" *ngIf="!loading() && onboardingStatus() === 'submitted'">
          <h3>Your Assigned Doctor</h3>
          <div class="doctor-info">
             <div class="avatar">Dr</div>
             <div class="details">
               <h4>Dr. Smith</h4> <!-- Placeholder or fetched -->
               <p>Cardiology</p>
             </div>
          </div>
          <button class="chat-btn" (click)="openChat()">Chat with Doctor</button>
        </div>
        
        <!-- Fallback for unknown status (e.g. 'new') -->
        <div class="card status-card" *ngIf="!loading() && onboardingStatus() && onboardingStatus() !== 'draft' && onboardingStatus() !== 'submitted'">
           <div class="status-content">
             <h3>Status: {{ onboardingStatus() }}</h3>
             <p>Your account status is currently being updated.</p>
             <button class="action-btn" (click)="continueOnboarding()">Check Onboarding</button>
           </div>
        </div>
        
        <!-- Fallback if status invalid -->
        <div *ngIf="!loading() && !onboardingStatus()" class="error-state">
           <p>Unable to load dashboard status.</p>
        </div>
        
        
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 800px; margin: 0 auto; padding: 20px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .header-actions { display: flex; align-items: center; gap: 15px; }
    .nav-link { cursor: pointer; color: #4299e1; font-weight: 600; text-decoration: underline; }
    .logout-btn { background: transparent; border: 1px solid #cbd5e0; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
    h3 { margin-top: 0; color: #2d3748; }
    
    .action-btn { background: #4299e1; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .chat-btn { background: #48bb78; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 20px; }
    
    .doctor-info { display: flex; align-items: center; margin-top: 20px; }
    .avatar { width: 60px; height: 60px; background: #edf2f7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; font-weight: bold; color: #4a5568; }
    .details h4 { margin: 0; font-size: 1.1rem; }
    .details p { margin: 4px 0 0; color: #718096; }
    
    .loading { text-align: center; color: #718096; margin-top: 40px; }
    .error-state { text-align: center; color: #e53e3e; margin-top: 20px; }
  `]
})
export class PatientDashboardComponent implements OnInit {
  onboardingService = inject(OnboardingService);
  router = inject(Router);

  onboardingStatus = signal<'draft' | 'submitted' | 'new' | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.loading.set(true);
    this.onboardingService.getStatus().subscribe({
      next: (res) => {
        let status = res.status;
        if (status === 'new') {
          status = 'draft';
        }
        this.onboardingStatus.set(status);
        this.loading.set(false);
      },
      error: () => {
        // If error (e.g. 404), maybe not started? Assume draft
        this.onboardingStatus.set('draft');
        this.loading.set(false);
      }
    });
  }

  continueOnboarding() {
    this.router.navigate(['/onboarding']);
  }

  openChat() {
    this.router.navigate(['/chat']);
  }

  logout() {
    localStorage.removeItem('docket_token');
    this.router.navigate(['/login']);
  }
}
