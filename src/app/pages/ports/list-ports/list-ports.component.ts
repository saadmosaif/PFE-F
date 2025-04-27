import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortService, Port } from '../../../services/port.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-port-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './list-ports.component.html'
})
export class ListPortsComponent implements OnInit {
  ports: Port[] = [];

  constructor(private portService: PortService) {}

  ngOnInit(): void {
    this.loadPorts();
  }

  loadPorts(): void {
    this.portService.getPorts().subscribe({
      next: (data) => {
        console.log('Ports récupérés:', data);  // Ajoute un log pour vérifier les données
        this.ports = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ports :', err);
      }
    });
  }
  editPort(port: Port) {
    // Rediriger vers une page édition avec ID ou ouvrir un modal
    console.log('Modifier le port', port);
  }
  
  deletePort(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce port ?')) {
      this.portService.deletePort(id).subscribe(() => {
        console.log('Port supprimé');
        this.loadPorts(); // recharger la liste après suppression
      });
    }
  }
}
