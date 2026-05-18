import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Videogame, VideogameService } from '../../services/videogame.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, HeaderComponent, FooterComponent],
  templateUrl: './juegos.component.html',
  styleUrl: './juegos.component.css'
})
export class JuegosComponent implements OnInit {
  games: Videogame[] = [];
  totalGames = 0;

  constructor(private videogameService: VideogameService) { }

  ngOnInit(): void {
    this.videogameService.getVideogames().subscribe({
      next: (response) => {
        this.games = response.content;
        this.totalGames = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading videogames:', error);
      }
    });
  }

  getCoverUrl(game: Videogame): string {
    if (game.image) {
      const imageName = game.image.replace('/images/', '');
      return `${environment.imageUrl}/${imageName}`;
    }

    return '../../../assets/game-placeholder.png';
  }
}