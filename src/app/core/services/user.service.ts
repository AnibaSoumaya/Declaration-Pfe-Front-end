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

getProfileImageUrl(imageProfil: string | null): string | null {
  if (!imageProfil) {
    return null;
  }
  
  // If the imageProfil already contains the full API path, use it as is
  if (imageProfil.startsWith('/images/')) {
    return `${this.apiUrl}${imageProfil}`;
  }
  
  // If it's just a filename, construct the full path
  if (imageProfil.includes('profile_')) {
    const filename = imageProfil.split('/').pop(); // Extract filename from path
    return `${this.apiUrl}/images/${filename}`;
  }
  
  // Fallback for other formats
  return `${this.apiUrl}${imageProfil}`;
}

  uploadProfileImage(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.apiUrl}/${userId}/image`, formData).pipe(
      catchError(error => this.handleError(error))
    );
  }

removeProfileImage(userId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${userId}/image`, {
    // Specify that we expect JSON response
    responseType: 'json'
  }).pipe(
    catchError(error => {
      console.error('Erreur lors de la suppression de l\'image', error);
      
      // Create a more descriptive error message
      let errorMessage = 'Erreur lors de la suppression de l\'image';
      
      if (error.status === 404) {
        errorMessage = 'Utilisateur non trouvé';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur lors de la suppression';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
}
getCurrentUser(): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/current`, { headers: this.getAuthHeaders() })
    .pipe(catchError(this.handleError));
}
restoreUser(id: number): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/restore/${id}`, {});
}
getAllArchivedUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/archived`);
}
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    console.log("Token d'authentification : ", token); 
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


  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/roles`, { headers: this.getAuthHeaders() }); 
  }
/*   getUserRole(id: number): Observable<Map<string, string>> {
    return this.http.get<Map<string, string>>(`${this.apiUrl}/${id}/role`);
  } */

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  archiveUser(userId: number): Observable<void> {
    console.log(`Archiver utilisateur avec ID: ${userId}`);
    return this.http.put<void>(`${this.apiUrl}/${userId}/archiver`, {}, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

 /*  private handleError(error: any) {
    console.error('Erreur détaillée :', error);  
    if (error.status === 403) {
      alert('You do not have permission to access this resource.');
    } else {
      console.error('Erreur générée :', error);
    }
    return throwError(() => new Error(error.message || 'An unknown error occurred.'));
  } */

    private handleError(error: any) {
      console.error('Erreur détaillée :', error);
      
      if (error.status === 403) {
        alert('You do not have permission to access this resource.');
      } else {
        console.error('Erreur générée :', error);
      }
      
      // Pour les erreurs 400 (Bad Request), renvoyer l'erreur originale
      if (error.status === 400) {
        return throwError(() => error);
      }
      
      // Pour les autres erreurs, continuer avec la transformation actuelle
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
    const url = `${this.apiUrl}/search?keyword=${keyword}`; 
    return this.http.get<User[]>(url, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
  
  
}
