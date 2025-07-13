import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { AuthService } from "../core/auth/auth.service";
import { Observable, throwError } from "rxjs";
import { Navire } from "./navire.service";
import { Client } from "./navire.service";

export enum VisiteMaritimeStatus {
  PREVU = 'PREVU',
  VALIDE = 'VALIDE',
  ACTIVE = 'ACTIVE',
  CLOTURE = 'CLOTURE',
  ANNULE = 'ANNULE'
}

export interface VisiteMaritimeSearchCriteria {
  // Basic search criteria
  numeroVisite?: string;
  numeroAD?: string;

  // Date range search criteria
  eta?: string; // Deprecated, use etaDebut and etaFin instead
  etd?: string; // Deprecated, use etdDebut and etdFin instead
  etaDebut?: string;
  etaFin?: string;
  etdDebut?: string;
  etdFin?: string;

  // Other search criteria
  statuts?: VisiteMaritimeStatus[];
  numeroDap?: string;
  terminal?: string;
  agentMaritimeId?: number;
  navireId?: number;
}

export interface AD {
  id?: number;
  numeroAD: string;
  dateETA: string;
  portProvenance: string;
  portDestination: string;
}

export interface DAP {
  id?: number;
  numeroDap: string;
  dateETA: string;
  portProvenance: string;
  portDestination: string;
}

export interface VisiteMaritime {
  id: number;
  numeroVisite: string;
  numeroAD?: string;
  terminal?: string;
  navire: string | Navire;
  agentMaritime: string | Client;
  status?: VisiteMaritimeStatus;
  statut?: VisiteMaritimeStatus;
  eta?: string;
  etd?: string;
  dateETA?: Date;
  dateETD?: Date;
  ad?: AD;
  dap?: DAP;
}

@Injectable({
  providedIn: 'root'
})
export class VisiteMaritimeService {
  private apiUrl = 'http://localhost:8082/api/visites-maritimes';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createVisiteMaritime(visiteMaritimeData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(this.apiUrl, visiteMaritimeData, { headers });
  }

  getVisitesMaritimes(criteria?: VisiteMaritimeSearchCriteria): Observable<VisiteMaritime[]> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token manquant, utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // If no criteria are provided, use GET to fetch all visites maritimes
    if (!criteria || Object.keys(criteria).length === 0) {
      return this.http.get<VisiteMaritime[]>(this.apiUrl, { headers });
    }

    // Otherwise, use POST with the search criteria
    return this.http.post<VisiteMaritime[]>(`${this.apiUrl}/search`, criteria, { headers });
  }

  getVisiteMaritimeById(id: number): Observable<VisiteMaritime> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<VisiteMaritime>(`${this.apiUrl}/${id}`, { headers });
  }

  updateVisiteMaritime(id: number, visiteMaritimeData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/${id}`, visiteMaritimeData, { headers });
  }

  deleteVisiteMaritime(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // AD operations
  addAD(visiteMaritimeId: number, adData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/${visiteMaritimeId}/ad`, adData, { headers });
  }

  updateAD(visiteMaritimeId: number, adData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/${visiteMaritimeId}/ad`, adData, { headers });
  }

  deleteAD(visiteMaritimeId: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${visiteMaritimeId}/ad`, { headers });
  }

  // DAP operations
  addDAP(visiteMaritimeId: number, dapData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/${visiteMaritimeId}/dap`, dapData, { headers });
  }

  updateDAP(visiteMaritimeId: number, dapData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/${visiteMaritimeId}/dap`, dapData, { headers });
  }

  deleteDAP(visiteMaritimeId: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${visiteMaritimeId}/dap`, { headers });
  }

  // Status operations
  annulerVisiteMaritime(visiteMaritimeId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${visiteMaritimeId}/annuler`, {}, { headers });
  }

  activerVisiteMaritime(visiteMaritimeId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${visiteMaritimeId}/activer`, {}, { headers });
  }

  cloturerVisiteMaritime(visiteMaritimeId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${visiteMaritimeId}/cloturer`, {}, { headers });
  }

  validerVisiteMaritime(visiteMaritimeId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${visiteMaritimeId}/valider`, {}, { headers });
  }

  /**
   * Changes the status of a maritime visit to any status without validation
   * @param visiteMaritimeId The ID of the maritime visit
   * @param newStatus The new status to set
   * @param comment Optional comment explaining the reason for the status change
   * @returns Observable of the updated maritime visit
   */
  changeStatus(visiteMaritimeId: number, newStatus: VisiteMaritimeStatus, comment?: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const requestBody = {
      newStatus: newStatus,
      comment: comment || ''
    };

    return this.http.put(`${this.apiUrl}/${visiteMaritimeId}/change-status`, requestBody, { headers });
  }
}
