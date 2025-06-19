import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { AuthService } from "../core/auth/auth.service";
import { Observable, throwError } from "rxjs";
import { Navire } from "./navire.service";
import { Client } from "./navire.service";

export enum EscaleStatus {
  PREVU = 'PREVU',
  VALIDE = 'VALIDE',
  ACTIVE = 'ACTIVE',
  CLOTURE = 'CLOTURE',
  ANNULE = 'ANNULE'
}

export interface EscaleSearchCriteria {
  numeroVisite?: string;
  numeroAD?: string;
  eta?: string;
  etd?: string;
  statuts?: EscaleStatus[];
  numeroDap?: string;
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

export interface Escale {
  id: number;
  numeroVisite: string;
  numeroAD?: string;
  terminal?: string;
  navire: Navire;
  agentMaritime: Client;
  status: EscaleStatus;
  eta?: string;
  etd?: string;
  ad?: AD;
  dap?: DAP;
}

@Injectable({
  providedIn: 'root'
})
export class EscaleService {
  private apiUrl = 'http://localhost:8082/api/escales';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createEscale(escaleData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(this.apiUrl, escaleData, { headers });
  }

  getEscales(criteria?: EscaleSearchCriteria): Observable<Escale[]> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token manquant, utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams();

    if (criteria) {
      if (criteria.numeroVisite) params = params.set('numeroVisite', criteria.numeroVisite);
      if (criteria.numeroAD) params = params.set('numeroAD', criteria.numeroAD);
      if (criteria.eta) params = params.set('eta', criteria.eta);
      if (criteria.etd) params = params.set('etd', criteria.etd);
      if (criteria.numeroDap) params = params.set('numeroDap', criteria.numeroDap);
      if (criteria.agentMaritimeId) params = params.set('agentMaritimeId', criteria.agentMaritimeId.toString());
      if (criteria.navireId) params = params.set('navireId', criteria.navireId.toString());
      if (criteria.statuts && criteria.statuts.length > 0) {
        criteria.statuts.forEach(statut => {
          params = params.append('statuts', statut);
        });
      }
    }

    return this.http.get<Escale[]>(`${this.apiUrl}`, { headers, params });
  }

  getEscaleById(id: number): Observable<Escale> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Escale>(`${this.apiUrl}/${id}`, { headers });
  }

  updateEscale(id: number, escaleData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/${id}`, escaleData, { headers });
  }

  deleteEscale(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // AD operations
  deleteAD(escaleId: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${escaleId}/ad`, { headers });
  }

  // DAP operations
  addDAP(escaleId: number, dapData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/${escaleId}/dap`, dapData, { headers });
  }

  updateDAP(escaleId: number, dapData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/${escaleId}/dap`, dapData, { headers });
  }

  deleteDAP(escaleId: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${escaleId}/dap`, { headers });
  }

  // Status operations
  annulerEscale(escaleId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${escaleId}/annuler`, {}, { headers });
  }

  activerEscale(escaleId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${escaleId}/activer`, {}, { headers });
  }

  cloturerEscale(escaleId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${escaleId}/cloturer`, {}, { headers });
  }
}
