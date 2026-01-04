import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-summary',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="step-content">
      <h2>Review Your Information</h2>
      <p class="subtitle">Please review your details before submitting.</p>

      <div class="summary-section">
        <h3>Personal Details</h3>
        <div class="row">
            <span>DOB:</span> <strong>{{ data.dob }}</strong>
        </div>
        <div class="row">
            <span>Gender:</span> <strong>{{ data.gender }}</strong>
        </div>
        <div class="row">
            <span>Phone:</span> <strong>{{ data.phone }}</strong>
        </div>
      </div>

      <div class="summary-section">
        <h3>Medical History</h3>
        <div class="row">
            <span>Allergies:</span> <strong>{{ data.allergies || 'None' }}</strong>
        </div>
        <div class="row">
            <span>Medications:</span> <strong>{{ data.medications || 'None' }}</strong>
        </div>
      </div>

      <div class="summary-section">
        <h3>Insurance</h3>
        <div class="row">
            <span>Provider:</span> <strong>{{ data.insurance_provider }}</strong>
        </div>
        <div class="row">
            <span>Policy #:</span> <strong>{{ data.policy_number }}</strong>
        </div>
      </div>
      
      <div class="actions">
        <button type="button" class="back-btn" (click)="back.emit()">Back</button>
        <button type="button" class="submit-btn" (click)="submit.emit()">Submit Registration</button>
      </div>
    </div>
  `,
    styles: [`
    .step-content { animation: fadeIn 0.3s ease; }
    .subtitle { color: #718096; margin-bottom: 20px; }
    .summary-section { background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    h3 { margin-top: 0; color: #2d3748; font-size: 1.1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .row span { color: #718096; }
    .actions { display: flex; justify-content: space-between; margin-top: 30px; }
    button { padding: 10px 20px; border-radius: 8px; cursor: pointer; border: none; font-size: 1rem; }
    .back-btn { background: white; color: #4a5568; border: 1px solid #cbd5e0; }
    .submit-btn { background: #48bb78; color: white; font-weight: bold; }
    .submit-btn:hover { background: #38a169; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SummaryComponent {
    @Input() data: any = {};
    @Output() submit = new EventEmitter<void>();
    @Output() back = new EventEmitter<void>();
}
