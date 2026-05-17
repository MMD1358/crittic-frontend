import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ProfileComment, ProfileService, UserProfile } from '../../services/profile.service';
import { Videogame } from '../../services/videogame.service';
import { Review } from '../../services/review.service';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, NgIf, NgFor, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  profile?: UserProfile;

  favorites: Videogame[] = [];
  reviews: Review[] = [];
  profileComments: ProfileComment[] = [];
  selectedProfileImage?: File;

  activeSection: 'favorites' | 'reviews' = 'favorites';

  newProfileComment = '';
  editingDescription = false;
  editedDescription = '';

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const username = params.get('username');

      if (!username) {
        return;
      }

      this.loadProfile(username);
    });
  }

  loadProfile(username: string): void {
    this.profileService.getProfile(username).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.editedDescription = profile.description || '';

        this.loadFavorites(profile.username);
        this.loadReviews(profile.username);
        this.loadProfileComments(profile.username);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  loadFavorites(username: string): void {
    this.profileService.getFavorites(username).subscribe({
      next: (favorites) => {
        this.favorites = favorites;
      },
      error: (error) => {
        console.error('Error loading favorite games:', error);
      }
    });
  }

  loadReviews(username: string): void {
    this.profileService.getReviews(username).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading profile reviews:', error);
      }
    });
  }

  loadProfileComments(username: string): void {
    this.profileService.getProfileComments(username).subscribe({
      next: (comments) => {
        this.profileComments = comments;
      },
      error: (error) => {
        console.error('Error loading profile comments:', error);
      }
    });
  }

  toggleFollow(): void {
    if (!this.profile || this.profile.ownProfile) {
      return;
    }

    const request = this.profile.followedByCurrentUser
      ? this.profileService.unfollow(this.profile.username)
      : this.profileService.follow(this.profile.username);

    request.subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: (error) => {
        console.error('Error changing follow status:', error);
        alert('You must log in to follow users.');
      }
    });
  }

  startEditProfile(): void {
    if (!this.profile?.ownProfile) {
      return;
    }

    this.editingDescription = true;
    this.editedDescription = this.profile.description || '';
  }

  cancelEditProfile(): void {
    this.editingDescription = false;
    this.editedDescription = this.profile?.description || '';
  }

  saveProfile(): void {
    if (!this.profile?.ownProfile) {
      return;
    }

    this.profileService.updateMyProfile({
      description: this.editedDescription,
      image: this.profile.image
    }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.editingDescription = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('You must log in to edit your profile.');
      }
    });
  }

  private updateProfileData(image?: string): void {
    this.profileService.updateMyProfile({
      description: this.editedDescription,
      image
    }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.editingDescription = false;
        this.selectedProfileImage = undefined;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('You must log in to edit your profile.');
      }
    });
  }

  sendProfileComment(): void {
    if (!this.profile) {
      return;
    }

    const content = this.newProfileComment.trim();

    if (!content) {
      return;
    }

    this.profileService.createProfileComment(this.profile.username, content).subscribe({
      next: () => {
        this.newProfileComment = '';
        this.loadProfileComments(this.profile!.username);
      },
      error: (error) => {
        console.error('Error creating profile comment:', error);
        alert('You must log in to comment.');
      }
    });
  }

  sendReply(comment: ProfileComment): void {
    if (!this.profile) {
      return;
    }

    const content = comment.newReply?.trim();

    if (!content) {
      return;
    }

    this.profileService.replyToProfileComment(comment.profileCommentId, content).subscribe({
      next: () => {
        comment.newReply = '';
        this.loadProfileComments(this.profile!.username);
      },
      error: (error) => {
        console.error('Error creating profile reply:', error);
        alert('You must log in to reply.');
      }
    });
  }

  toggleCommentLike(comment: ProfileComment): void {
    const request = comment.likedByCurrentUser
      ? this.profileService.unlikeProfileComment(comment.profileCommentId)
      : this.profileService.likeProfileComment(comment.profileCommentId);

    request.subscribe({
      next: (updatedComment) => {
        comment.likesCount = updatedComment.likesCount;
        comment.likedByCurrentUser = updatedComment.likedByCurrentUser;
      },
      error: (error) => {
        console.error('Error changing profile comment like:', error);
        alert('You must log in to like comments.');
      }
    });
  }

  startEditComment(comment: ProfileComment): void {
    if (!comment.ownComment) {
      return;
    }

    comment.editing = true;
    comment.editedContent = comment.content;
  }

  cancelEditComment(comment: ProfileComment): void {
    comment.editing = false;
    comment.editedContent = '';
  }

  saveEditComment(comment: ProfileComment): void {
    const content = comment.editedContent?.trim();

    if (!content) {
      return;
    }

    this.profileService.updateProfileComment(comment.profileCommentId, content).subscribe({
      next: (updatedComment) => {
        comment.content = updatedComment.content;
        comment.editing = false;
        comment.editedContent = '';
      },
      error: (error) => {
        console.error('Error editing profile comment:', error);
        alert('You cannot edit this comment.');
      }
    });
  }

  setSection(section: 'favorites' | 'reviews'): void {
    this.activeSection = section;
  }

  getProfileImageUrl(): string {
    if (this.profile?.image) {
      const imageName = this.profile.image.replace('/images/', '');
      return `http://localhost:8080/api/images/${imageName}`;
    }

    return '../../../assets/default-user.png';
  }

  getUserImageUrl(image?: string): string {
    if (image) {
      const imageName = image.replace('/images/', '');
      return `http://localhost:8080/api/images/${imageName}`;
    }

    return '../../../assets/default-user.png';
  }

  getGameImageUrl(game: Videogame): string {
    if (game.image) {
      const imageName = game.image.replace('/images/', '');
      return `http://localhost:8080/api/images/${imageName}`;
    }

    return '../../../assets/game-placeholder.png';
  }

  getStars(rating: number | null): string {
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

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0 || !this.profile?.ownProfile) {
      return;
    }

    const file = input.files[0];

    this.profileService.uploadProfileImage(file).subscribe({
      next: (response) => {
        this.profileService.updateMyProfile({
          description: this.profile?.description || '',
          image: response.filename
        }).subscribe({
          next: (profile) => {
            this.profile = profile;
          },
          error: (error) => {
            console.error('Error updating profile image:', error);
            alert('There was an error updating your profile image.');
          }
        });
      },
      error: (error) => {
        console.error('Error uploading profile image:', error);
        alert('There was an error uploading your profile image.');
      }
    });
  }
  
  startChat(): void {
  if (!this.profile || this.profile.ownProfile) {
    return;
  }

  this.chatService.startChat(this.profile.username).subscribe({
    next: () => {
      this.router.navigate(['/chats']);
    },
    error: (error) => {
      console.error('Error starting chat:', error);
      alert('You must log in to start a chat.');
    }
  });
}
}