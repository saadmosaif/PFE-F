import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PortService } from '../../../services/port.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-port',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-port.component.html',
  styleUrls: ['./create-port.component.scss']
})
export class CreatePortComponent {
  portForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private portService: PortService,
    private router: Router
  ) {
    this.portForm = this.fb.group({
      codePort: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{5}$/) // 5 lettres majuscules
        ]
      ],
      nomPort: ['', Validators.required],
      localisation: ['', Validators.required],
      capacite: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/)
        ]
      ]
    });
  }

  get f() {
    return this.portForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.portForm.invalid) {
      return;
    }

    this.portService.createPort(this.portForm.value).subscribe({
      next: () => {
        this.successMessage = 'Port créé avec succès !';
        this.portForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la création du port.";
        console.error(err);
      }
    });
  }
}
