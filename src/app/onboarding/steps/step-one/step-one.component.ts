import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-step-one',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="step-content">
      <h2>Personal Information</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Date of Birth</label>
          <input type="date" formControlName="dob">
        </div>
        
        <div class="form-group">
          <label>Gender</label>
          <select formControlName="gender">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" formControlName="phone" placeholder="+1234567890">
        </div>
        
        <div class="actions">
          <button type="submit" [disabled]="form.invalid">Next: Medical History</button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .step-content { animation: fadeIn 0.3s ease; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; color: #4a5568; }
    input, select { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
    .actions { display: flex; justify-content: flex-end; margin-top: 30px; }
    button { background: #4299e1; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    button:disabled { background: #cbd5e0; cursor: not-allowed; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepOneComponent implements OnInit {
    @Input() initialData: any = {};
    @Output() next = new EventEmitter<any>();

    fb = inject(FormBuilder);

    form = this.fb.group({
        dob: ['', Validators.required],
        gender: ['', Validators.required],
        phone: ['', Validators.required]
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
