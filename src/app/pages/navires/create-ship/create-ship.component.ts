import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {NavireService} from "../../../services/navire.service";

@Component({
  selector: 'app-create-ship',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-ship.component.html',
  styleUrls: ['./create-ship.component.scss']
})
export class CreateShipComponent {
  shipForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private shipService: NavireService,
    private router: Router
  ) {
    this.shipForm = this.fb.group({
      numeroIMO: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{5}$/) // 5 lettres majuscules
        ]
      ],
      nom: ['', Validators.required],
      type: ['', Validators.required],
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
    return this.shipForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.shipForm.invalid) {
      return;
    }

    this.shipService.createNavire(this.shipForm.value).subscribe({
      next: () => {
        this.successMessage = 'navire créé avec succès !';
        this.shipForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la création du navire.";
        console.error(err);
      }
    });
  }
}
