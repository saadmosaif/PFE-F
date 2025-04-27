import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../core/auth/auth.service";
import { Observable, throwError } from "rxjs";
import { Port } from "./port.service";

export interface Terminal {
  id: number;
  type: string;
  numero: string;
  capacite: number;
  codeport: string;
  deleted: boolean;
  port: Port;
}

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  private apiUrl = 'http://localhost:8082/api/terminaux';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createTerminal(terminalData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(this.apiUrl, terminalData, { headers });
  }

  getTerminaux(): Observable<Terminal[]> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token manquant, utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Terminal[]>(`${this.apiUrl}/all`, { headers });
  }

  updateTerminal(id: number, terminalData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    // 🔥 Nettoyer l'objet terminal avant d'envoyer
    const cleanedTerminal = {
      type: terminalData.type,
      numero: terminalData.numero,
      capacite: terminalData.capacite,
      codePort: terminalData.port?.codePort // on récupère juste le code
    };
  
    return this.http.put(`${this.apiUrl}/${id}`, cleanedTerminal, { headers });
  }
  

  deleteTerminal(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
