import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environment/environment';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { ChatMessage, ChatService, ChatSummary } from '../../services/chat.service';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    FormsModule,
    RouterLink,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent implements OnInit, OnDestroy {
  currentUsername: string | null = null;

  conversations: ChatSummary[] = [];
  selectedConversation?: ChatSummary;
  messages: ChatMessage[] = [];

  newMessage = '';

  messagePage = 0;
  messageSize = 20;
  loadingOlderMessages = false;

  private refreshInterval?: number;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.username$.subscribe({
      next: (username) => {
        this.currentUsername = username;
      }
    });

    this.loadChats();

    this.refreshInterval = window.setInterval(() => {
      this.refreshChats();
      this.refreshCurrentConversation();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      window.clearInterval(this.refreshInterval);
    }
  }

  loadChats(): void {
    this.chatService.getMyChats().subscribe({
      next: (conversations) => {
        this.conversations = conversations;

        if (conversations.length > 0 && !this.selectedConversation) {
          this.selectConversation(conversations[0]);
        }
      },
      error: (error) => {
        console.error('Error loading chats:', error);
        alert('You must log in to see your chats.');
      }
    });
  }

  refreshChats(): void {
    this.chatService.getMyChats().subscribe({
      next: (conversations) => {
        this.conversations = conversations;

        if (this.selectedConversation) {
          const updatedSelected = conversations.find(
            chat => chat.conversationId === this.selectedConversation?.conversationId
          );

          if (updatedSelected) {
            this.selectedConversation = updatedSelected;
          }
        }
      },
      error: () => {}
    });
  }

  selectConversation(conversation: ChatSummary): void {
    this.selectedConversation = conversation;
    this.messagePage = 0;

    this.chatService.getMessages(conversation.conversationId, this.messagePage, this.messageSize).subscribe({
      next: (messages) => {
        this.messages = messages;

        this.chatService.markAsRead(conversation.conversationId).subscribe({
          next: () => {
            conversation.hasUnreadMessages = false;
          },
          error: (error) => {
            console.error('Error marking chat as read:', error);
          }
        });

        setTimeout(() => this.scrollChatToBottom(), 0);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  refreshCurrentConversation(): void {
    if (!this.selectedConversation) {
      return;
    }

    this.chatService
      .getMessages(this.selectedConversation.conversationId, 0, this.messageSize)
      .subscribe({
        next: (latestMessages) => {
          const lastCurrentId = this.messages[this.messages.length - 1]?.messageId;
          const lastIncomingId = latestMessages[latestMessages.length - 1]?.messageId;

          if (lastIncomingId && lastIncomingId !== lastCurrentId) {
            this.messages = latestMessages;

            this.chatService.markAsRead(this.selectedConversation!.conversationId).subscribe({
              next: () => {
                if (this.selectedConversation) {
                  this.selectedConversation.hasUnreadMessages = false;
                }
              }
            });

            setTimeout(() => this.scrollChatToBottom(), 0);
          }
        },
        error: () => {}
      });
  }

  loadOlderMessages(event: Event): void {
    const element = event.target as HTMLElement;

    if (element.scrollTop > 10 || this.loadingOlderMessages || !this.selectedConversation) {
      return;
    }

    this.loadingOlderMessages = true;
    this.messagePage++;

    this.chatService
      .getMessages(this.selectedConversation.conversationId, this.messagePage, this.messageSize)
      .subscribe({
        next: (olderMessages) => {
          if (olderMessages.length === 0) {
            this.messagePage--;
            this.loadingOlderMessages = false;
            return;
          }

          const previousHeight = element.scrollHeight;

          this.messages = [
            ...olderMessages,
            ...this.messages
          ];

          setTimeout(() => {
            element.scrollTop = element.scrollHeight - previousHeight;
            this.loadingOlderMessages = false;
          }, 0);
        },
        error: (error) => {
          console.error('Error loading older messages:', error);
          this.messagePage--;
          this.loadingOlderMessages = false;
        }
      });
  }

  sendMessage(): void {
    const content = this.newMessage.trim();

    if (!content || !this.selectedConversation) {
      return;
    }

    this.chatService
      .sendMessage(this.selectedConversation.conversationId, content)
      .subscribe({
        next: (message) => {
          this.messages.push(message);
          this.newMessage = '';

          this.selectedConversation!.lastMessage = message.content;
          this.selectedConversation!.lastMessageAt = message.sentAt;

          this.moveConversationToTop(this.selectedConversation!);

          setTimeout(() => this.scrollChatToBottom(), 0);
        },
        error: (error) => {
          console.error('Error sending message:', error);
          alert('You must log in to send messages.');
        }
      });
  }

  moveConversationToTop(conversation: ChatSummary): void {
    this.conversations = [
      conversation,
      ...this.conversations.filter(
        (chat) => chat.conversationId !== conversation.conversationId
      )
    ];
  }

  scrollChatToBottom(): void {
    const chatMessages = document.querySelector('.chat-messages') as HTMLElement;

    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderUsername === this.currentUsername;
  }

  getUserImageUrl(image?: string): string {
    if (image) {
      const imageName = image.replace('/images/', '');
      return `${environment.imageUrl}/${imageName}`;
    }

    return '../../../assets/default-user.png';
  }

  formatChatDate(date?: string): string {
    if (!date) {
      return '';
    }

    const today = new Date();
    const messageDate = new Date(date);

    const isToday =
      today.getDate() === messageDate.getDate() &&
      today.getMonth() === messageDate.getMonth() &&
      today.getFullYear() === messageDate.getFullYear();

    if (isToday) {
      return 'Now';
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isYesterday =
      yesterday.getDate() === messageDate.getDate() &&
      yesterday.getMonth() === messageDate.getMonth() &&
      yesterday.getFullYear() === messageDate.getFullYear();

    if (isYesterday) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-GB');
  }
}