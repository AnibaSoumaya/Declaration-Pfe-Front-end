import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/User.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8084/api/utilisateurs';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    console.log("Token d'authentification : ", token); // Vérifiez si le token est bien récupéré.
    if (!token) {
      throw new Error('No authentication token found!');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUserById(userId: number): Observable<{ id: number, email: string, firstLogin: boolean }> {
    return this.http.get<{ id: number, email: string, firstLogin: boolean }>(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));;
  }
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Correcting the getRoles() method URL
  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/roles`, { headers: this.getAuthHeaders() }); 
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  archiveUser(userId: number): Observable<void> {
    console.log(`Archiver utilisateur avec ID: ${userId}`);
    return this.http.put<void>(`${this.apiUrl}/${userId}/archiver`, {}, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Erreur détaillée :', error);  // Afficher plus d'informations sur l'erreur dans la console.
    if (error.status === 403) {
      alert('You do not have permission to access this resource.');
    } else {
      console.error('Erreur générée :', error);
    }
    return throwError(() => new Error(error.message || 'An unknown error occurred.'));
  }
  
  
  updateUser(user: User): Observable<User> {
    console.log("Données envoyées à l'update :", user);
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
  

  
  changePassword(newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { newPassword });
  }
  
  

  getUsersByName(keyword: string): Observable<User[]> {
    const url = `${this.apiUrl}/search?keyword=${keyword}`; // L'URL backend avec le mot-clé
    return this.http.get<User[]>(url, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
  
  
}
