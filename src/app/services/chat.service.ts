import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatSummary {
  conversationId: number;

  otherUserId: number;
  otherUsername: string;
  otherUserImage?: string;

  lastMessage?: string;
  lastMessageAt?: string;

  hasUnreadMessages: boolean;
}

export interface ChatMessage {
  messageId: number;
  conversationId: number;

  senderId: number;
  senderUsername: string;
  senderImage?: string;

  content: string;
  sentAt: string;

  readByCurrentUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/v1/chats';

  constructor(private http: HttpClient) {}

  getMyChats(): Observable<ChatSummary[]> {
    return this.http.get<ChatSummary[]>(this.apiUrl);
  }

  getMessages(
    conversationId: number,
    page: number = 0,
    size: number = 20
  ): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/${conversationId}/messages?page=${page}&size=${size}`
    );
  }

  startChat(username: string): Observable<ChatSummary> {
    return this.http.post<ChatSummary>(`${this.apiUrl}/start/${username}`, {});
  }

  sendMessage(conversationId: number, content: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.apiUrl}/${conversationId}/messages`,
      { content }
    );
  }

  markAsRead(conversationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${conversationId}/read`, {});
  }

  hasUnreadMessages(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/unread`);
  }
}