import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatusTransition {
  from: string;
  to: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-status-workflow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-workflow.component.html',
  styleUrls: ['./status-workflow.component.scss']
})
export class StatusWorkflowComponent implements OnInit {
  @Input() currentStatus: any = ''; // Accept any type for currentStatus
  @Input() statusHistory: any[] = [];

  // Define the status workflow
  statusFlow = [
    { status: 'PREVU', label: 'Prévu', description: 'Visite maritime prévue' },
    { status: 'VALIDE', label: 'Validé', description: 'Visite maritime validée' },
    { status: 'ACTIVE', label: 'Activé', description: 'Visite maritime en cours' },
    { status: 'CLOTURE', label: 'Clôturé', description: 'Visite maritime terminée' }
  ];

  // Define possible transitions
  statusTransitions: StatusTransition[] = [
    { from: 'PREVU', to: 'VALIDE', label: 'Valider' },
    { from: 'VALIDE', to: 'ACTIVE', label: 'Activer' },
    { from: 'ACTIVE', to: 'CLOTURE', label: 'Clôturer' },
    { from: 'VALIDE', to: 'CLOTURE', label: 'Clôturer' },
    { from: 'PREVU', to: 'ANNULE', label: 'Annuler' },
    { from: 'VALIDE', to: 'ANNULE', label: 'Annuler' },
    { from: 'ACTIVE', to: 'ANNULE', label: 'Annuler' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  // Check if a status is the current status
  isCurrentStatus(status: string): boolean {
    return this.currentStatus === status;
  }

  // Check if a status is completed (comes before the current status in the flow)
  isCompletedStatus(status: string): boolean {
    if (this.currentStatus === 'ANNULE') {
      return false; // No completed statuses for ANNULE
    }

    const currentIndex = this.statusFlow.findIndex(s => s.status === this.currentStatus);
    const statusIndex = this.statusFlow.findIndex(s => s.status === status);

    return statusIndex < currentIndex;
  }

  // Check if a status is a possible next status
  isPossibleNextStatus(status: string): boolean {
    return this.statusTransitions.some(t =>
      t.from === this.currentStatus && t.to === status
    );
  }

  // Get the status class for styling
  getStatusClass(status: string): string {
    if (this.isCurrentStatus(status)) {
      return 'current';
    } else if (this.isCompletedStatus(status)) {
      return 'completed';
    } else if (this.isPossibleNextStatus(status)) {
      return 'possible';
    } else if (status === 'ANNULE' && this.currentStatus === 'ANNULE') {
      return 'current';
    } else {
      return 'inactive';
    }
  }

  // Get the label for a status
  getStatusLabel(statusCode: string): string {
    const status = this.statusFlow.find(s => s.status === statusCode);
    return status ? status.label : statusCode === 'ANNULE' ? 'Annulé' : statusCode;
  }
}
