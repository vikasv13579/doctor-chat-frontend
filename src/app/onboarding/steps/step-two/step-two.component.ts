import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-step-two',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="step-content">
      <h2>Medical History</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Known Allergies (if any)</label>
          <textarea formControlName="allergies" rows="3" placeholder="List any allergies..."></textarea>
        </div>
        
        <div class="form-group">
          <label>Current Medications</label>
          <textarea formControlName="medications" rows="3" placeholder="List current medications..."></textarea>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" formControlName="history_diabetes">
            Diabetes
          </label>
          <label>
            <input type="checkbox" formControlName="history_hypertension">
            Hypertension
          </label>
           <label>
            <input type="checkbox" formControlName="history_asthma">
            Asthma
          </label>
        </div>
        
        <div class="actions">
          <button type="button" class="back-btn" (click)="back.emit()">Back</button>
          <button type="submit" [disabled]="form.invalid">Next: Insurance</button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .step-content { animation: fadeIn 0.3s ease; }
    .form-group { margin-bottom: 20px; }
    textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical; }
    label { display: block; margin-bottom: 8px; font-weight: 500; color: #4a5568; }
    .checkbox-group label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-weight: normal; }
    .checkbox-group input { width: auto; }
    .actions { display: flex; justify-content: space-between; margin-top: 30px; }
    button { background: #4299e1; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .back-btn { background: white; color: #4a5568; border: 1px solid #cbd5e0; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepTwoComponent implements OnInit {
    @Input() initialData: any = {};
    @Output() next = new EventEmitter<any>();
    @Output() back = new EventEmitter<void>();

    fb = inject(FormBuilder);

    form = this.fb.group({
        allergies: [''],
        medications: [''],
        history_diabetes: [false],
        history_hypertension: [false],
        history_asthma: [false]
    });

    ngOnInit() {
        if (this.initialData) {
            this.form.patchValue(this.initialData);
        }
    }

    onSubmit() {
        if (this.form.valid) {
            this.next.emit(this.form.value);
        }
    }
}
