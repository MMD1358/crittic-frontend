import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Videogame } from './videogame.service';
import { Review } from './review.service';
import { environment } from '../../environment/environment';

export interface UserProfile {
  userId: number;
  username: string;
  image?: string;
  description?: string;
  followersCount: number;
  followingCount: number;
  followedByCurrentUser: boolean;
  ownProfile: boolean;
}

export interface ProfileComment {
  profileCommentId: number;
  profileUserId: number;
  authorUserId: number;
  authorUsername: string;
  authorImage?: string;
  parentCommentId?: number;
  content: string;
  createdAt: string;
  likesCount: number;
  likedByCurrentUser: boolean;
  ownComment: boolean;
  replies: ProfileComment[];

  newReply?: string;
  editing?: boolean;
  editedContent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/chats`;

  constructor(private http: HttpClient) { }

  getProfile(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profiles/${username}`);
  }

  updateMyProfile(data: {
    description: string;
    image?: string;
  }) {
    return this.http.put<UserProfile>(`${this.apiUrl}/profiles/me`, data);
  }

  follow(username: string): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}/profiles/${username}/follow`, {});
  }

  unfollow(username: string): Observable<UserProfile> {
    return this.http.delete<UserProfile>(`${this.apiUrl}/profiles/${username}/follow`);
  }

  getFavorites(username: string): Observable<Videogame[]> {
    return this.http.get<Videogame[]>(`${this.apiUrl}/profiles/${username}/favorites`);
  }

  addFavorite(videogameId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/profiles/me/favorites/${videogameId}`, {});
  }

  removeFavorite(videogameId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profiles/me/favorites/${videogameId}`);
  }

  getReviews(username: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/profiles/${username}/reviews`);
  }

  getProfileComments(username: string): Observable<ProfileComment[]> {
    return this.http.get<ProfileComment[]>(`${this.apiUrl}/profiles/${username}/comments`);
  }

  createProfileComment(username: string, content: string): Observable<ProfileComment> {
    return this.http.post<ProfileComment>(`${this.apiUrl}/profiles/${username}/comments`, {
      content
    });
  }

  replyToProfileComment(commentId: number, content: string): Observable<ProfileComment> {
    return this.http.post<ProfileComment>(`${this.apiUrl}/profile-comments/${commentId}/reply`, {
      content
    });
  }

  updateProfileComment(commentId: number, content: string): Observable<ProfileComment> {
    return this.http.put<ProfileComment>(`${this.apiUrl}/profile-comments/${commentId}`, {
      content
    });
  }

  deleteProfileComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profile-comments/${commentId}`);
  }

  likeProfileComment(commentId: number): Observable<ProfileComment> {
    return this.http.post<ProfileComment>(`${this.apiUrl}/profile-comments/${commentId}/like`, {});
  }

  unlikeProfileComment(commentId: number): Observable<ProfileComment> {
    return this.http.delete<ProfileComment>(`${this.apiUrl}/profile-comments/${commentId}/like`);
  }

  uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ filename: string }>(
      `${this.apiUrl}/uploads/profile-image`,
      formData
    );
  }
}