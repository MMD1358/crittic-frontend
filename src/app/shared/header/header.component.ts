import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { Videogame, VideogameService } from '../../services/videogame.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, AsyncPipe, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  loggedIn$ = this.authService.loggedIn$;
  username$ = this.authService.username$;

  hasNewMessages = false;
  private unreadInterval?: number;
  searchText = '';
  searchResults: Videogame[] = [];
  showResults = false;

  constructor(
    private authService: AuthService,
    private videogameService: VideogameService,
    private router: Router,
    private chatService: ChatService
  ) { }

  onSearchChange(): void {
    const search = this.searchText.trim();

    if (search.length === 0) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }

    this.videogameService.getVideogames(search).subscribe({
      next: (response) => {
        this.searchResults = response.content;
        this.showResults = true;
      },
      error: (error) => {
        console.error('Error searching games:', error);
        this.searchResults = [];
        this.showResults = false;
      }
    });
  }

  goToGame(game: Videogame): void {
    this.searchText = '';
    this.searchResults = [];
    this.showResults = false;

    this.router.navigate(['/juego', game.videogameId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.checkUnreadMessages();

    this.unreadInterval = window.setInterval(() => {
      this.checkUnreadMessages();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.unreadInterval) {
      window.clearInterval(this.unreadInterval);
    }
  }

  checkUnreadMessages(): void {
    this.chatService.hasUnreadMessages().subscribe({
      next: (hasUnread) => {
        this.hasNewMessages = hasUnread;
      },
      error: () => {
        this.hasNewMessages = false;
      }
    });
  }
}