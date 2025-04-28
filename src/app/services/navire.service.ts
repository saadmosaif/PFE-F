import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../core/auth/auth.service";
import {Observable, throwError} from "rxjs";
import {Port} from "./port.service";
import Keycloak from "keycloak-js";

export interface Navire {
  id: number;
  nom: string;
  numeroIMO: string;
  type: string;
  capacite: number;
  deleted: boolean;
}

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  compagnie: string;
  code: string;
  deleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavireService {
  private apiUrl = 'http://localhost:8082/api/navires';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createNavire(navireData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(this.apiUrl, navireData, { headers });
  }

  getNavires(): Observable<Navire[]> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token manquant, utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Navire[]>(`${this.apiUrl}/all`, { headers });
  }

  updateNavire(id: number, navireData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'  // Très important pour éviter 415
    });
    return this.http.put(`${this.apiUrl}/${id}`, navireData, { headers });
  }





  deleteNavire(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
