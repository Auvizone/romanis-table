import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Produits } from 'src/app/Models/produits.interface';
import { Clients } from 'src/app/Models/clients.interface';
import { Pricings } from 'src/app/Models/pricing.interface';
import { Prix } from 'src/app/Models/prix.interface';
import { Designation } from 'src/app/Models/designation.interface';


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

  public readAllClients(): Observable<Clients[]> {
    return this.httpClient.get<Clients[]>(`${environment.apiUrl}/fetch_clients/`)
  }

  public readAllPricings(): Observable<Pricings[]> {
    return this.httpClient.get<Pricings[]>(`${environment.apiUrl}/fetch_custom_pricing/`)
  }

  public createPricings(pricing: Pricings): Observable<Pricings[]> {
    console.log('pricing', pricing)
    return this.httpClient.post<Pricings[]>(`${environment.apiUrl}/post_custom_pricing/`, pricing)
  }

  public createPricingsTwo(pricing: Pricings): Observable<Pricings[]> {
    return this.httpClient.post<Pricings[]>(`${environment.apiUrl}/post_custom_pricing/`, pricing)
  }

  public updatePricings(pricing: Pricings): Observable<Pricings[]> {
    return this.httpClient.patch<Pricings[]>(`${environment.apiUrl}/patch_custom_pricing/`, pricing)
  }
  
  public deletePricings(pricing: any): Observable<Pricings[]> {
    return this.httpClient.post<Pricings[]>(`${environment.apiUrl}/delete_custom_pricing/`, pricing)
  }
  
  public readAllPrix(): Observable<Prix[]> {
    return this.httpClient.get<Prix[]>(`${environment.apiUrl}/fetch_customer_pricing/`)
  }

  public createPrix(prix: Prix): Observable<Prix[]> {
    return this.httpClient.post<Prix[]>(`${environment.apiUrl}/post_customer_pricing/`, prix)
  }

  public updateColumnOrder(columnOrder: { name: string, position: number }[]): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/post_column_order/`, { columnOrder });
  }

//   public createPrix(prix: any): Observable<any> {
//     // Directly send the parameters as the body
//     const body = {
//         custom_pricing_id: prix.params.custom_pricing_id,
//         designation_id: prix.params.designation_id,
//         value: prix.params.value
//     };

//     return this.httpClient.post(`${environment.apiUrl}/post_customer_pricing/`, body, {
//         headers: new HttpHeaders({
//             'Content-Type': 'application/json',
//         }),
//         withCredentials: false
//     }).pipe(
//         catchError(this.handleError)
//     );
// }

// private handleError(error: HttpErrorResponse) {
//     console.error('An error occurred:', error);
//     if (error.error instanceof ErrorEvent) {
//         // Client-side or network error
//         console.error('Client-side error:', error.error.message);
//     } else {
//         // Backend returned an unsuccessful response code
//         console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
//     }
//     return throwError(() => new Error('Something bad happened; please try again later.'));
// }



  public updatePrix(prix: Prix): Observable<Prix[]> {
    return this.httpClient.patch<Prix[]>(`${environment.apiUrl}/patch_customer_pricing/`, prix)
  }

  public deletePrix(prix: Prix): Observable<Prix[]> {
    return this.httpClient.delete<Prix[]>(`${environment.apiUrl}/delete_customer_pricing/`, { body: prix })
  }

}