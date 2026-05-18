import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface Videogame {
  videogameId: number;
  title: string;
  releaseDate: string;
  genre: string;
  image?: string;
  description?: string;
  authorId: number;
  authorName: string;
  averageRating: number | null;
  reviewCount: number;
  likesCount: number;
  likedByCurrentUser: boolean;
  currentUserRating: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class VideogameService {
  private apiUrl = `${environment.apiUrl}/videogames`;

  constructor(private http: HttpClient) { }

  getVideogames(search: string = ''): Observable<PageResponse<Videogame>> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<PageResponse<Videogame>>(`${this.apiUrl}${params}`);
  }

  getVideogameById(id: number): Observable<Videogame> {
    return this.http.get<Videogame>(`${this.apiUrl}/${id}`);
  }

  likeVideogame(id: number) {
    return this.http.post<Videogame>(`${this.apiUrl}/${id}/like`, {});
  }

  unlikeVideogame(id: number) {
    return this.http.delete<Videogame>(`${this.apiUrl}/${id}/like`);
  }

  rateVideogame(id: number, rating: number) {
    return this.http.post<Videogame>(`${this.apiUrl}/${id}/rating`, {
      rating
    });
  }
}