import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../core/auth/auth.service";
import {Observable, throwError} from "rxjs";

export interface Navire {
  id: number;
  nom: string;
  numeroIMO: string;
  type: string;
  capacite: string;
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
export class ClientService {

  private apiUrl = 'http://localhost:8082/api/clients';

  constructor(private http: HttpClient, private authService: AuthService) {}
    createClient(clientData: any): Observable<any> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.http.post(this.apiUrl, clientData, { headers });
    }

    getClient(): Observable<Client[]> {
      const token = this.authService.getToken();

      if (!token) {
      console.error('Token manquant, utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Client[]>(`${this.apiUrl}/all`, { headers });
  }

    updateClient(id: number, clientData: any): Observable<any> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.http.put(`${this.apiUrl}/${id}`, clientData, { headers });
    }





    deleteClient(id: number): Observable<void> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
    }
  }



