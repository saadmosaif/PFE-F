import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth/auth.service';
import { Observable, throwError } from 'rxjs';

export interface Port {
  id: number;
  codePort: string;
  nomPort: string;
  localisation: string;
  capacite: number;
  deleted: boolean;
}

export interface Terminal {
  id: number;
  port: Port;
  type: string;
  numero: string;
  capacite: number;
  deleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PortService {
  private apiUrl = 'http://localhost:8082/api/ports';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createPort(portData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(this.apiUrl, portData, { headers });
  }


  getPorts(): Observable<Port[]> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token manquant, utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Port[]>(`${this.apiUrl}/all`, { headers });
  }

  updatePort(id: number, portData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'  // Très important pour éviter 415
    });
    return this.http.put(`${this.apiUrl}/${id}`, portData, { headers });
  }





  deletePort(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
