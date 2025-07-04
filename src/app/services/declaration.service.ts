import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { AuthService } from "../core/auth/auth.service";
import { Observable, throwError } from "rxjs";
import { Escale } from "./escale.service";

export enum TypeContenant {
  CONTENEUR = 'CONTENEUR',
  RORO = 'RORO',
  DIVERS = 'DIVERS'
}

export enum SensTrafic {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT'
}

export enum TypeConteneur {
  DRY = 'DRY',
  REEFER = 'REEFER',
  OPEN_TOP = 'OPEN_TOP',
  FLAT_RACK = 'FLAT_RACK',
  TANK = 'TANK'
}

export interface DeclarationSearchCriteria {
  numeroConnaissement?: string;
  escaleId?: number;
  agentMaritimeId?: number;
  sensTrafic?: SensTrafic;
  typeContenant?: TypeContenant;
}

export interface Connaissement {
  id: number;
  numeroConnaissement: string;
  escale?: Escale;
  agentMaritime: string;
  sensTrafic: SensTrafic;
  portProvenance: string;
  portDestination: string;
  typeContenant: TypeContenant;
  nombreUnites: number;
  volume: number;
  visiteMaritimeId: number;
  numeroVisite: string;
}

export interface Conteneur {
  id: number;
  connaissement: Connaissement;
  numeroConteneur: string;
  codeISO: string;
  typeConteneur: TypeConteneur;
  dimensions: string;
}

export interface RORO {
  id: number;
  connaissement: Connaissement;
  numeroIdentification: string;
  marque: string;
  modele: string;
  poids: number;
}

export interface Divers {
  id: number;
  connaissement: Connaissement;
  description: string;
  quantite: number;
  poids: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeclarationService {
  private apiUrl = 'http://localhost:8082/api/declarations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Connaissements (Bills of Lading)
  getConnaissements(criteria?: DeclarationSearchCriteria): Observable<Connaissement[]> {
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
      if (criteria.numeroConnaissement) params = params.set('numeroConnaissement', criteria.numeroConnaissement);
      if (criteria.escaleId) params = params.set('escaleId', criteria.escaleId.toString());
      if (criteria.agentMaritimeId) params = params.set('agentMaritimeId', criteria.agentMaritimeId.toString());
      if (criteria.sensTrafic) params = params.set('sensTrafic', criteria.sensTrafic);
      if (criteria.typeContenant) params = params.set('typeContenant', criteria.typeContenant);
    }

    return this.http.get<Connaissement[]>(`${this.apiUrl}/connaissements/all`, { headers, params });
  }

  getConnaissementById(id: number): Observable<Connaissement> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Connaissement>(`${this.apiUrl}/connaissements/${id}`, { headers });
  }

  createConnaissement(connaissementData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/connaissements`, connaissementData, { headers });
  }

  updateConnaissement(id: number, connaissementData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/connaissements/${id}`, connaissementData, { headers });
  }

  deleteConnaissement(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/connaissements/${id}`, { headers });
  }

  // Conteneurs (Containers)
  getConteneurs(connaissementId?: number): Observable<Conteneur[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams();
    if (connaissementId) {
      params = params.set('connaissementId', connaissementId.toString());
    }

    return this.http.get<Conteneur[]>(`${this.apiUrl}/conteneurs`, { headers, params });
  }

  getConteneurById(id: number): Observable<Conteneur> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Conteneur>(`${this.apiUrl}/conteneurs/${id}`, { headers });
  }

  createConteneur(conteneurData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/conteneurs`, conteneurData, { headers });
  }

  updateConteneur(id: number, conteneurData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/conteneurs/${id}`, conteneurData, { headers });
  }

  deleteConteneur(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/conteneurs/${id}`, { headers });
  }

  // RORO
  getROROs(connaissementId?: number): Observable<RORO[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams();
    if (connaissementId) {
      params = params.set('connaissementId', connaissementId.toString());
    }

    return this.http.get<RORO[]>(`${this.apiUrl}/roros`, { headers, params });
  }

  getROROById(id: number): Observable<RORO> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<RORO>(`${this.apiUrl}/roros/${id}`, { headers });
  }

  createRORO(roroData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/roros`, roroData, { headers });
  }

  updateRORO(id: number, roroData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/roros/${id}`, roroData, { headers });
  }

  deleteRORO(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/roros/${id}`, { headers });
  }

  // Divers (Miscellaneous)
  getDivers(connaissementId?: number): Observable<Divers[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams();
    if (connaissementId) {
      params = params.set('connaissementId', connaissementId.toString());
    }

    return this.http.get<Divers[]>(`${this.apiUrl}/divers`, { headers, params });
  }

  getDiversById(id: number): Observable<Divers> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Divers>(`${this.apiUrl}/divers/${id}`, { headers });
  }

  createDivers(diversData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/divers`, diversData, { headers });
  }

  updateDivers(id: number, diversData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/divers/${id}`, diversData, { headers });
  }

  deleteDivers(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/divers/${id}`, { headers });
  }
}
