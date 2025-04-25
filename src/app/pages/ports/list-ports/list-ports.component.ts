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
        this.ports = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ports :', err);
      }
    });
  }
}
