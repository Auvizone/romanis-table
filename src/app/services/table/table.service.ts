import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Produits } from 'src/app/Models/produits.interface';
import { Clients } from 'src/app/Models/clients.interface';
import { Pricings } from 'src/app/Models/pricing.interface';
import { Prix } from 'src/app/Models/prix.interface';
import { Designation } from 'src/app/Models/designation.interface';

/// SI JE VEUX ACCEDER AUX 2 MATRICES IL FAUT RAJOUTER ${matrice} mais pas config actuellement


@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(
    public httpClient: HttpClient,
  ) { }

  public readAllProducts(): Observable<Produits[]> {
    return this.httpClient.get<Produits[]>(`${environment.apiUrl}/fetch_products/`)
  }

  public readAllDesignation(): Observable<Designation[]> {
      return this.httpClient.get<Designation[]>(`${environment.apiUrl}/fetch_designation/`)
  }

  public readAllClients(matrice: string): Observable<Clients[]> {
    return this.httpClient.get<Clients[]>(`${environment.apiUrl}/fetch_clients/`)
  }

  public readAllPricings(): Observable<Pricings[]> {
    return this.httpClient.get<Pricings[]>(`${environment.apiUrl}/fetch_custom_pricing/`)
  }

  public createPricings(pricing: Pricings): Observable<Pricings[]> {
    console.log('pricing', pricing)
    return this.httpClient.post<Pricings[]>(`${environment.apiUrl}/post_custom_pricing/`, pricing)
  }

  public createPricingsTwo(pricing: Pricings, matrice: string): Observable<Pricings[]> {
    return this.httpClient.post<Pricings[]>(`${environment.apiUrl}/post_custom_pricing/`, pricing)
  }

  public updatePricings(pricing: Pricings, matrice: string): Observable<Pricings[]> {
    return this.httpClient.patch<Pricings[]>(`${environment.apiUrl}/patch_custom_pricing/`, pricing)
  }
  
  public deletePricings(pricing: any, matrice: string): Observable<Pricings[]> {
    return this.httpClient.post<Pricings[]>(`${environment.apiUrl}/delete_custom_pricing/`, pricing)
  }
  
  public readAllPrix(matrice: string): Observable<Prix[]> {
    return this.httpClient.get<Prix[]>(`${environment.apiUrl}/fetch_customer_pricing/`)
  }

  public createPrix(prix: Prix, matrice: string): Observable<Prix[]> {
    console.log('matrice ICIIIII', matrice)
    return this.httpClient.post<Prix[]>(`${environment.apiUrl}/post_customer_pricing/`, prix)
  }

  public updateColumnOrder(columnOrder: { name: string, position: number }[]): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/post_column_order/`, { columnOrder });
  }

  public updatePrix(prix: Prix, matrice: string): Observable<Prix[]> {
    return this.httpClient.patch<Prix[]>(`${environment.apiUrl}/patch_customer_pricing/`, prix)
  }

  public deletePrix(prix: Prix, matrice: string): Observable<Prix[]> {
    return this.httpClient.delete<Prix[]>(`${environment.apiUrl}/delete_customer_pricing/`, { body: prix })
  }

}