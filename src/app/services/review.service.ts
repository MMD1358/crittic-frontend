import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from './comment.service';
import { environment } from '../../environment/environment';

export interface Review {
  reviewId: number;
  videogameId: number;
  videogameTitle: string;
  userId: number;
  username: string;
  userImage?: string;
  rating: number;
  content: string;
  createdAt: string;
  likesCount: number;
  answersCount: number;
  likedByCurrentUser?: boolean;
  comments?: Comment[];

  editing?: boolean;
  editedContent?: string;
  newAnswer?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  getReviewsByVideogame(videogameId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/videogame/${videogameId}`);
  }

  createReview(data: {
    videogameId: number;
    rating: number;
    content: string;
  }) {
    return this.http.post<Review>(this.apiUrl, data);
  }

  likeReview(reviewId: number) {
    return this.http.post<Review>(`${this.apiUrl}/${reviewId}/like`, {});
  }

  unlikeReview(reviewId: number) {
    return this.http.delete<Review>(`${this.apiUrl}/${reviewId}/like`);
  }

  updateReview(reviewId: number, data: {
    videogameId: number;
    rating: number;
    content: string;
  }) {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, data);
  }
}