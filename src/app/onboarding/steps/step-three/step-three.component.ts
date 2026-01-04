import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-step-three',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="step-content">
      <h2>Insurance Information</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Insurance Provider</label>
          <input type="text" formControlName="insurance_provider" placeholder="e.g. Blue Cross">
        </div>
        
        <div class="form-group">
          <label>Policy Number</label>
          <input type="text" formControlName="policy_number" placeholder="Policy #">
        </div>

        <div class="form-group">
          <label>Group Number (Optional)</label>
          <input type="text" formControlName="group_number">
        </div>
        
        <div class="actions">
          <button type="button" class="back-btn" (click)="back.emit()">Back</button>
          <button type="submit" [disabled]="form.invalid">Review & Submit</button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .step-content { animation: fadeIn 0.3s ease; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; color: #4a5568; }
    input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
    .actions { display: flex; justify-content: space-between; margin-top: 30px; }
    button { background: #4299e1; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .back-btn { background: white; color: #4a5568; border: 1px solid #cbd5e0; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepThreeComponent implements OnInit {
    @Input() initialData: any = {};
    @Output() next = new EventEmitter<any>();
    @Output() back = new EventEmitter<void>();

    fb = inject(FormBuilder);

    form = this.fb.group({
        insurance_provider: ['', Validators.required],
        policy_number: ['', Validators.required],
        group_number: ['']
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
