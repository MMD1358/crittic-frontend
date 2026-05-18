import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface Comment {
  commentId: number;
  reviewId: number;
  userId: number;
  username: string;
  userImage?: string;
  content: string;
  createdAt: string;
  likesCount: number;
  likedByCurrentUser: boolean;

  editing?: boolean;
  editedContent?: string;
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
export class CommentService {
  private apiUrl = `${environment.apiUrl}/chats`;

  constructor(private http: HttpClient) { }

  getCommentsByReview(reviewId: number): Observable<PageResponse<Comment>> {
    return this.http.get<PageResponse<Comment>>(`${this.apiUrl}/review/${reviewId}`);
  }

  createComment(data: {
    reviewId: number;
    content: string;
  }) {
    return this.http.post<Comment>(this.apiUrl, data);
  }

  likeComment(commentId: number) {
    return this.http.post<Comment>(`${this.apiUrl}/${commentId}/like`, {});
  }

  unlikeComment(commentId: number) {
    return this.http.delete<Comment>(`${this.apiUrl}/${commentId}/like`);
  }

  updateComment(commentId: number, data: {
    reviewId: number;
    content: string;
  }) {
    return this.http.put<Comment>(`${this.apiUrl}/${commentId}`, data);
  }

}