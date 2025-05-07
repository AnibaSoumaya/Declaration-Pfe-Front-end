import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Declaration } from '../models/declaration';

@Injectable({
  providedIn: 'root'
})
export class DeclarationService {

  private apiUrl = 'http://localhost:8084/api/declarations'; 

  constructor(private http: HttpClient) { }


  getAllDeclarations(): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(`${this.apiUrl}`);
  }
  
  getDeclarationDetails(id: number): Observable<Declaration> {
    return this.http.get<Declaration>(`${this.apiUrl}/${id}/details`);
  }
  

  generatePdf(id: number): Observable<Blob> {
    const url = `${this.apiUrl}/${id}/generate-pdf`;
    return this.http.get(url, { responseType: 'blob' }); // Important: 'blob' pour recevoir un fichier binaire
  }
  
  assignGerantToDeclaration(declarationId: number, gerantId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${declarationId}/assign-user/${gerantId}`, {});
  }


  searchDeclarations(keyword: string): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }
  
  
}
