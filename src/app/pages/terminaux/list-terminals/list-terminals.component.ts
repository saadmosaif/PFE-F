import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalService, Terminal } from '../../../services/terminal.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminals-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './list-terminals.component.html',
  styleUrls: ['./list-terminals.component.scss']
})
export class ListTerminalsComponent implements OnInit {
  terminaux: Terminal[] = [];
  editingTerminal: Terminal | null = null;

  constructor(private terminalService: TerminalService) {}

  ngOnInit(): void {
    this.loadTerminaux();
  }

  loadTerminaux(): void {
    this.terminalService.getTerminaux().subscribe({
      next: (data) => {
        console.log('terminaux récupérés:', data);
        this.terminaux = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des terminaux :', err);
      }
    });
  }

  deleteTerminal(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce terminal ?')) {
      this.terminalService.deleteTerminal(id).subscribe({
        next: () => {
          console.log('Terminal supprimé');
          this.loadTerminaux(); // Recharger la liste
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du terminal :', err);
        }
      });
    }
  }

  editTerminal(terminal: Terminal): void {
    this.editingTerminal = { ...terminal }; // On clone pour éviter de modifier directement
  }

  saveTerminal(): void {
    if (!this.editingTerminal) {
      return;
    }
  
    // Nettoyage de l'objet avant de l'envoyer
    const terminalData = {
      id: this.editingTerminal.id,
      type: this.editingTerminal.type,
      numero: this.editingTerminal.numero,
      capacite: this.editingTerminal.capacite,
      codePort: this.editingTerminal.port?.codePort // on prend juste le codePort !
    };
  
    this.terminalService.updateTerminal(this.editingTerminal.id, terminalData).subscribe({
      next: () => {
        console.log('Terminal modifié avec succès');
        this.editingTerminal = null;
        this.loadTerminaux(); // Recharger la liste après modification
      },
      error: (err) => {
        console.error('Erreur lors de la modification du terminal :', err);
      }
    });
  }
  

  cancelEdit(): void {
    this.editingTerminal = null;
  }
}
