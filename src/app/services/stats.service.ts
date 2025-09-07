import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PortCallStat {
  port: string;
  mois: string;
  total: number;
}

export interface VesselTypeStat {
  type: string;
  total: number;
}

export interface WaitingTimeStat {
  port: string;
  moyenne: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Récupère les statistiques du nombre d'escales par port et par mois
   * @returns Observable avec les données d'escales par port
   */
  getPortCallStats(): Observable<PortCallStat[]> {
    return this.http.get<PortCallStat[]>(`${this.apiUrl}/stats/escales-par-port`);
  }

  /**
   * Récupère les statistiques de répartition des types de navires
   * @returns Observable avec les données de types de navires
   */
  getVesselTypeStats(): Observable<VesselTypeStat[]> {
    return this.http.get<VesselTypeStat[]>(`${this.apiUrl}/stats/types-navires`);
  }

  /**
   * Récupère les statistiques de temps moyen d'attente par port
   * @returns Observable avec les données de temps d'attente
   */
  getWaitingTimeStats(): Observable<WaitingTimeStat[]> {
    return this.http.get<WaitingTimeStat[]>(`${this.apiUrl}/stats/attente-moyenne`);
  }
}
