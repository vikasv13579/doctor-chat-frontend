import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../onboarding.service';
import { Router } from '@angular/router';

import { StepOneComponent } from '../steps/step-one/step-one.component';
import { StepTwoComponent } from '../steps/step-two/step-two.component';
import { StepThreeComponent } from '../steps/step-three/step-three.component';
import { SummaryComponent } from '../summary/summary.component';

@Component({
  selector: 'app-onboarding-container',
  standalone: true,
  imports: [CommonModule, StepOneComponent, StepTwoComponent, StepThreeComponent, SummaryComponent],
  template: `
    <div class="onboarding-layout">
      <div class="progress-bar">
        <div class="progress" [style.width.%]="(currentStep() / 4) * 100"></div>
      </div>
      
      <div class="step-container">
        <h1>Patient Onboarding</h1>
        <p class="subtitle">Step {{ currentStep() }} of 4</p>
        
        <div *ngIf="loading" class="loading">Loading...</div>
        <div *ngIf="error" class="error-state">{{ error }}</div>
        
        <div *ngIf="!loading && !error">
           <app-step-one 
             *ngIf="currentStep() === 1" 
             [initialData]="onboardingData()"
             (next)="nextStep($event)">
           </app-step-one>

           <app-step-two 
             *ngIf="currentStep() === 2" 
             [initialData]="onboardingData()"
             (next)="nextStep($event)" 
             (back)="prevStep()">
           </app-step-two>

           <app-step-three 
             *ngIf="currentStep() === 3" 
             [initialData]="onboardingData()"
             (next)="nextStep($event)" 
             (back)="prevStep()">
           </app-step-three>

           <app-summary 
             *ngIf="currentStep() === 4" 
             [data]="onboardingData()"
             (submit)="submit()" 
             (back)="prevStep()">
           </app-summary>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-layout { max-width: 800px; margin: 40px auto; padding: 20px; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; margin-bottom: 30px; overflow: hidden; }
    .progress { height: 100%; background: #4299e1; transition: width 0.3s ease; }
    .step-container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    h1 { margin-top: 0; color: #2d3748; margin-bottom: 5px; }
    .subtitle { color: #718096; margin-bottom: 30px; }
    .loading { text-align: center; color: #718096; padding: 40px; }
    .error-state { text-align: center; color: #e53e3e; padding: 40px; background: #fff5f5; border-radius: 8px; margin-top: 20px; }
  `]
})
export class OnboardingContainerComponent implements OnInit {
  onboardingService = inject(OnboardingService);
  router = inject(Router);

  currentStep = this.onboardingService.currentStep;
  // We'll reference the service one but update it locally before saving.
  onboardingData = this.onboardingService.onboardingData;

  loading = true;
  error = '';

  ngOnInit() {
    console.log('OnboardingContainer: ngOnInit started');
    this.onboardingService.getStatus().subscribe({
      next: (res) => {
        console.log('OnboardingContainer: Status received', res);
        if (res.status === 'submitted') {
          this.router.navigate(['/patient-dashboard']);
          return;
        }

        let initialStep = res.current_step || 1;
        // Verify we aren't getting stuck?
        console.log('OnboardingContainer: Setting step', initialStep);

        // Restore state
        this.onboardingService.currentStep.set(initialStep);
        this.onboardingService.onboardingData.set(res.data || {});

        this.loading = false;
        console.log('OnboardingContainer: loading set to false');
      },
      error: (err) => {
        console.error('OnboardingContainer: Failed to load status', err);
        this.error = 'Failed to load onboarding status: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  nextStep(stepData: any) {
    // 1. Merge data
    const updatedData = { ...this.onboardingData(), ...stepData };
    this.onboardingService.onboardingData.set(updatedData);

    // 2. Increment step
    const nextStep = this.currentStep() + 1;
    this.currentStep.set(nextStep);

    // 3. Save draft
    this.onboardingService.saveDraft(nextStep, updatedData).subscribe();
  }

  prevStep() {
    const prevStep = this.currentStep() - 1;
    if (prevStep >= 1) {
      this.currentStep.set(prevStep);
    }
  }

  submit() {
    this.loading = true;
    this.onboardingService.submitForm().subscribe({
      next: () => {
        this.router.navigate(['/patient-dashboard']);
      },
      error: (err) => {
        console.error('Submission failed', err);
        this.loading = false;
        alert('Submission failed. Please try again.');
      }
    });
  }
}
