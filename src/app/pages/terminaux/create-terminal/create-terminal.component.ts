import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TerminalService } from '../../../services/terminal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-terminal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-terminal.component.html',
  styleUrls: ['./create-terminal.component.scss']
})
export class CreateTerminalComponent {
  terminalFrom: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private terminalService: TerminalService,
    private router: Router
  ) {
    this.terminalFrom = this.fb.group({
      type: ['', Validators.required],
      capacite: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/)
        ]
      ],
      numero: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/)
        ]
      ],
      codePort: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]+$/)
        ]
      ]
    });
  }

  get f() {
    return this.terminalFrom.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.terminalFrom.invalid) {
      return;
    }

    this.terminalService.createTerminal(this.terminalFrom.value).subscribe({
      next: () => {
        this.successMessage = 'Terminal créé avec succès !';
        this.terminalFrom.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la création du terminal.";
        console.error(err);
      }
    });
  }
}


