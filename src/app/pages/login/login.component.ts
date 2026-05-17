import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf, HeaderComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formValue = this.loginForm.getRawValue();

    this.loading = true;

    this.authService.login(
      {
        username: formValue.username!,
        password: formValue.password!
      },
      !!formValue.rememberMe
    ).subscribe({
      next: (response) => {
        this.loading = false;

        if (!response.token) {
          this.errorMessage = response.message || 'Invalid username or password.';
          return;
        }

        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = 'Incorrect username or password.';
        } else {
          this.errorMessage = 'There was an error logging in.';
        }
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.touched && control.invalid;
  }
}