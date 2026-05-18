import { Component, OnInit } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Comment, CommentService } from '../../services/comment.service';
import { Videogame, VideogameService } from '../../services/videogame.service';
import { Review, ReviewService } from '../../services/review.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-plantilla-juego',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    NgFor,
    DecimalPipe,
    FormsModule,
    FooterComponent,
    HeaderComponent
  ],
  templateUrl: './plantilla-juego.component.html',
  styleUrl: './plantilla-juego.component.css'
})
export class PlantillaJuegoComponent implements OnInit {
  game?: Videogame;
  reviews: Review[] = [];
  newReviewContent = '';
  currentUsername: string | null = null;
  userRating = 0;
  hoverRating = 0;

  constructor(
    private route: ActivatedRoute,
    private videogameService: VideogameService,
    private reviewService: ReviewService,
    private commentService: CommentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.username$.subscribe({
      next: (username) => {
        this.currentUsername = username;
      }
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadGame(id);
    this.loadReviews(id);
  }

  loadGame(id: number): void {
    this.videogameService.getVideogameById(id).subscribe({
      next: (game) => {
        this.game = game;
        this.userRating = game.currentUserRating || 0;
      },
      error: (error) => {
        console.error('Error loading game:', error);
      }
    });
  }

  loadReviews(videogameId: number): void {
    this.reviewService.getReviewsByVideogame(videogameId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;

        this.reviews.forEach((review) => {
          this.commentService.getCommentsByReview(review.reviewId).subscribe({
            next: (response) => {
              review.comments = response.content;
            },
            error: (error) => {
              console.error('Error loading answers:', error);
              review.comments = [];
            }
          });
        });
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  getCoverUrl(): string {
    if (this.game?.image) {
      const imageName = this.game.image.replace('/images/', '');
      return `${environment.imageUrl}/${imageName}`;
    }

    return '../../../assets/game-placeholder.png';
  }

  getUserImageUrl(review: Review): string {
    if (review.userImage) {
      const imageName = review.userImage.replace('/images/', '');
      return `${environment.imageUrl}/${imageName}`;
    }

    return '../../../assets/default-user.png';
  }

  getStars(rating: number): string {
    const roundedRating = Math.round(rating || 0);
    return '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  rateGame(rating: number): void {
    if (!this.game) {
      return;
    }

    this.videogameService.rateVideogame(this.game.videogameId, rating).subscribe({
      next: (updatedGame) => {
        this.game = updatedGame;
        this.userRating = updatedGame.currentUserRating || rating;

        this.loadReviews(updatedGame.videogameId);
      },
      error: (error) => {
        console.error('Error rating game:', error);
        alert('You must log in to rate this game.');
      }
    });
  }

  toggleLike(): void {
    if (!this.game) {
      return;
    }

    const request = this.game.likedByCurrentUser
      ? this.videogameService.unlikeVideogame(this.game.videogameId)
      : this.videogameService.likeVideogame(this.game.videogameId);

    request.subscribe({
      next: (updatedGame) => {
        this.game = updatedGame;
      },
      error: (error) => {
        console.error('Error changing like:', error);
        alert('You must log in to like this game.');
      }
    });
  }

  submitReview(): void {
    if (!this.game) {
      return;
    }

    if (!this.userRating || this.userRating < 1) {
      alert('You must rate the game before writing a review.');
      return;
    }

    const content = this.newReviewContent.trim();

    if (!content) {
      return;
    }

    this.reviewService.createReview({
      videogameId: this.game.videogameId,
      rating: this.userRating,
      content
    }).subscribe({
      next: () => {
        this.newReviewContent = '';
        this.loadReviews(this.game!.videogameId);
        this.loadGame(this.game!.videogameId);
      },
      error: (error) => {
        console.error('Error creating review:', error);
        alert('You must log in to write a review.');
      }
    });
  }

  submitAnswer(review: Review): void {
    const content = review.newAnswer?.trim();

    if (!content) {
      return;
    }

    this.commentService.createComment({
      reviewId: review.reviewId,
      content
    }).subscribe({
      next: () => {
        review.newAnswer = '';

        if (this.game) {
          this.loadReviews(this.game.videogameId);
        }
      },
      error: (error) => {
        console.error('Error creating answer:', error);
        alert('You must log in to reply.');
      }
    });
  }

  toggleReviewLike(review: Review): void {
    const request = review.likedByCurrentUser
      ? this.reviewService.unlikeReview(review.reviewId)
      : this.reviewService.likeReview(review.reviewId);

    request.subscribe({
      next: (updatedReview) => {
        review.likesCount = updatedReview.likesCount;
        review.likedByCurrentUser = updatedReview.likedByCurrentUser;
      },
      error: (error) => {
        console.error('Error changing review like:', error);
        alert('You must log in to like this review.');
      }
    });
  }

  toggleCommentLike(comment: Comment): void {
    const request = comment.likedByCurrentUser
      ? this.commentService.unlikeComment(comment.commentId)
      : this.commentService.likeComment(comment.commentId);

    request.subscribe({
      next: (updatedComment) => {
        comment.likesCount = updatedComment.likesCount;
        comment.likedByCurrentUser = updatedComment.likedByCurrentUser;
      },
      error: (error) => {
        console.error('Error changing answer like:', error);
        alert('You must log in to like this answer.');
      }
    });
  }

  startEditReview(review: Review): void {
    review.editing = true;
    review.editedContent = review.content;
  }

  cancelEditReview(review: Review): void {
    review.editing = false;
    review.editedContent = '';
  }

  saveEditReview(review: Review): void {
    if (!this.game) {
      return;
    }

    const content = review.editedContent?.trim();

    if (!content) {
      return;
    }

    this.reviewService.updateReview(review.reviewId, {
      videogameId: this.game.videogameId,
      rating: review.rating,
      content
    }).subscribe({
      next: (updatedReview) => {
        review.content = updatedReview.content;
        review.rating = updatedReview.rating;
        review.editing = false;
        review.editedContent = '';
      },
      error: (error) => {
        console.error('Error editing review:', error);
        alert('You cannot edit this review.');
      }
    });
  }

  canEditReview(review: Review): boolean {
    return !!this.currentUsername && this.currentUsername === review.username;
  }

  canEditComment(comment: Comment): boolean {
    return !!this.currentUsername && this.currentUsername === comment.username;
  }

  startEditComment(comment: Comment): void {
    comment.editing = true;
    comment.editedContent = comment.content;
  }

  cancelEditComment(comment: Comment): void {
    comment.editing = false;
    comment.editedContent = '';
  }

  saveEditComment(comment: Comment): void {
    const content = comment.editedContent?.trim();

    if (!content) {
      return;
    }

    this.commentService.updateComment(comment.commentId, {
      reviewId: comment.reviewId,
      content
    }).subscribe({
      next: (updatedComment) => {
        comment.content = updatedComment.content;
        comment.editing = false;
        comment.editedContent = '';
      },
      error: (error) => {
        console.error('Error editing answer:', error);
        alert('You cannot edit this answer.');
      }
    });
  }

  getCommentUserImageUrl(comment: Comment): string {
    if (comment.userImage) {
      const imageName = comment.userImage.replace('/images/', '');
      return `${environment.imageUrl}/${imageName}`;
    }

    return '../../../assets/default-user.png';
  }
}