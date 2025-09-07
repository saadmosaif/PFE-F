import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VisiteMaritimeService, VisiteMaritime, VisiteMaritimeStatus, AD, DAP } from '../../../services/visite-maritime.service';
import { Navire, Client } from '../../../services/navire.service';
import { StatusWorkflowComponent } from '../../../components/status-workflow/status-workflow.component';

@Component({
  selector: 'app-view-visite-maritime',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusWorkflowComponent],
  templateUrl: './view-visite-maritime.component.html',
  styleUrls: ['./view-visite-maritime.component.scss']
})
export class ViewVisiteMaritimeComponent implements OnInit {
  visiteMaritime: VisiteMaritime | null = null;
  loading = true;
  errorMessage = '';
  activeTab = 'ad';
  dapForm: FormGroup;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visiteMaritimeService: VisiteMaritimeService,
    private fb: FormBuilder
  ) {
    this.dapForm = this.fb.group({
      numeroDap: ['', Validators.required],
      dateETA: ['', Validators.required],
      portProvenance: ['', Validators.required],
      portDestination: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVisiteMaritime(+id);
    } else {
      this.errorMessage = 'ID de visite maritime non trouvé';
      this.loading = false;
    }
  }

  loadVisiteMaritime(id: number): void {
    this.visiteMaritimeService.getVisiteMaritimeById(id).subscribe({
      next: (data) => {
        this.visiteMaritime = data;

        // Map statut to status if status is undefined
        if (this.visiteMaritime && this.visiteMaritime.statut && !this.visiteMaritime.status) {
          console.log('Mapping statut to status:', this.visiteMaritime.statut);
          this.visiteMaritime.status = this.visiteMaritime.statut;
        }

        this.loading = false;

        // If there's an AD, pre-fill the DAP form with AD data
        if (this.visiteMaritime.ad) {
          this.dapForm.patchValue({
            dateETA: this.visiteMaritime.ad.dateETA,
            portProvenance: this.visiteMaritime.ad.portProvenance,
            portDestination: this.visiteMaritime.ad.portDestination
          });
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la visite maritime';
        this.loading = false;
        console.error(error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // AD operations
  deleteAD(): void {
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette AD ?')) {
      this.visiteMaritimeService.deleteAD(this.visiteMaritime.id).subscribe({
        next: () => {
          if (this.visiteMaritime) {
            this.visiteMaritime.ad = undefined;
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression de l\'AD';
          console.error(error);
        }
      });
    }
  }

  // DAP operations
  submitDAP(): void {
    if (!this.visiteMaritime || this.dapForm.invalid) return;

    const dapData: DAP = this.dapForm.value;

    this.visiteMaritimeService.addDAP(this.visiteMaritime.id, dapData).subscribe({
      next: (updatedVisiteMaritime) => {
        this.visiteMaritime = updatedVisiteMaritime;
        this.activeTab = 'dap';
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'ajout du DAP';
        console.error(error);
      }
    });
  }

  updateDAP(): void {
    if (!this.visiteMaritime || this.dapForm.invalid) return;

    const dapData: DAP = this.dapForm.value;

    this.visiteMaritimeService.updateDAP(this.visiteMaritime.id, dapData).subscribe({
      next: (updatedVisiteMaritime) => {
        this.visiteMaritime = updatedVisiteMaritime;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour du DAP';
        console.error(error);
      }
    });
  }

  deleteDAP(): void {
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce DAP ?')) {
      this.visiteMaritimeService.deleteDAP(this.visiteMaritime.id).subscribe({
        next: () => {
          if (this.visiteMaritime) {
            this.visiteMaritime.dap = undefined;
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression du DAP';
          console.error(error);
        }
      });
    }
  }

  // Status operations with enhanced confirmation
  annulerVisiteMaritime(): void {
    if (!this.visiteMaritime) return;

    const comment = prompt(
      'Êtes-vous sûr de vouloir annuler cette visite maritime ?\n\nVous pouvez ajouter un commentaire (optionnel):',
      ''
    );

    // If user clicks Cancel, comment will be null
    if (comment !== null) {
      this.showStatusChangeLoading('Annulation en cours...');

      this.visiteMaritimeService.annulerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
          this.hideStatusChangeLoading();
          this.showStatusChangeSuccess('Visite maritime annulée avec succès');

          // Log the comment (in a real app, this would be saved to the database)
          if (comment.trim()) {
            console.log('Commentaire d\'annulation:', comment);
          }
        },
        error: (error) => {
          this.hideStatusChangeLoading();
          this.errorMessage = 'Erreur lors de l\'annulation de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  activerVisiteMaritime(): void {
    if (!this.visiteMaritime) return;

    const comment = prompt(
      'Êtes-vous sûr de vouloir activer cette visite maritime ?\n\nVous pouvez ajouter un commentaire (optionnel):',
      ''
    );

    if (comment !== null) {
      this.showStatusChangeLoading('Activation en cours...');

      this.visiteMaritimeService.activerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
          this.hideStatusChangeLoading();
          this.showStatusChangeSuccess('Visite maritime activée avec succès');

          if (comment.trim()) {
            console.log('Commentaire d\'activation:', comment);
          }
        },
        error: (error) => {
          this.hideStatusChangeLoading();

          // Extract error message from response if available
          let errorMsg = 'Erreur lors de l\'activation de la visite maritime';

          if (error.error && typeof error.error === 'string') {
            // If the error response contains a string message
            errorMsg += `: ${error.error}`;
          } else if (error.message) {
            // If there's a message property in the error object
            errorMsg += `: ${error.message}`;
          } else if (error.status === 0) {
            // Network error
            errorMsg += `: Impossible de se connecter au serveur`;
          }

          this.errorMessage = errorMsg;
          console.error('Activation error:', error);
        }
      });
    }
  }

  cloturerVisiteMaritime(): void {
    if (!this.visiteMaritime) return;

    const comment = prompt(
      'Êtes-vous sûr de vouloir clôturer cette visite maritime ?\n\nVous pouvez ajouter un commentaire (optionnel):',
      ''
    );

    if (comment !== null) {
      this.showStatusChangeLoading('Clôture en cours...');

      this.visiteMaritimeService.cloturerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
          this.hideStatusChangeLoading();
          this.showStatusChangeSuccess('Visite maritime clôturée avec succès');

          if (comment.trim()) {
            console.log('Commentaire de clôture:', comment);
          }
        },
        error: (error) => {
          this.hideStatusChangeLoading();
          this.errorMessage = 'Erreur lors de la clôture de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  validerVisiteMaritime(): void {
    if (!this.visiteMaritime) return;

    const comment = prompt(
      'Êtes-vous sûr de vouloir valider cette visite maritime ?\n\nVous pouvez ajouter un commentaire (optionnel):',
      ''
    );

    if (comment !== null) {
      this.showStatusChangeLoading('Validation en cours...');

      this.visiteMaritimeService.validerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
          this.hideStatusChangeLoading();
          this.showStatusChangeSuccess('Visite maritime validée avec succès');

          if (comment.trim()) {
            console.log('Commentaire de validation:', comment);
          }
        },
        error: (error) => {
          this.hideStatusChangeLoading();

          // Extract error message from response if available
          let errorMsg = 'Erreur lors de la validation de la visite maritime';

          if (error.error && typeof error.error === 'string') {
            // If the error response contains a string message
            errorMsg += `: ${error.error}`;
          } else if (error.message) {
            // If there's a message property in the error object
            errorMsg += `: ${error.message}`;
          } else if (error.status === 0) {
            // Network error
            errorMsg += `: Impossible de se connecter au serveur`;
          }

          this.errorMessage = errorMsg;
          console.error('Validation error:', error);
        }
      });
    }
  }

  // Helper methods for status change UI feedback
  statusChangeMessage: string = '';
  statusChangeLoading: boolean = false;
  statusChangeSuccess: boolean = false;

  private showStatusChangeLoading(message: string): void {
    this.statusChangeLoading = true;
    this.statusChangeMessage = message;
    this.statusChangeSuccess = false;
    // In a real app, you would show a loading indicator
  }

  private hideStatusChangeLoading(): void {
    this.statusChangeLoading = false;
  }

  private showStatusChangeSuccess(message: string): void {
    this.statusChangeSuccess = true;
    this.statusChangeMessage = message;
    // In a real app, you would show a success message for a few seconds
    setTimeout(() => {
      this.statusChangeSuccess = false;
      this.statusChangeMessage = '';
    }, 3000);
  }


  goBack(): void {
    this.router.navigate(['/visites-maritimes']);
  }

  // Helper methods for type checking
  getNavireNom(navire: string | Navire): string {
    if (navire && typeof navire === 'object' && 'nom' in navire) {
      return navire.nom;
    }
    return navire as string;
  }

  getAgentMaritimeCompagnie(agentMaritime: string | Client): string {
    if (agentMaritime && typeof agentMaritime === 'object' && 'compagnie' in agentMaritime) {
      return agentMaritime.compagnie;
    }
    return agentMaritime as string;
  }

  getStatusLowerCase(status: VisiteMaritimeStatus | undefined): string {
    return status ? status.toLowerCase() : '';
  }
}
