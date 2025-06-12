// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // ActivatedRoute pour returnUrl
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  private returnUrl: string = '/products'; // URL par défaut après connexion

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute, // Pour lire les queryParams
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Récupérer l'URL de retour des queryParams
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/products';
    });

    this.loginForm = this.fb.group({
      // Pré-remplir pour admin pour faciliter les tests pendant le développement
      email: ['admin@example.com', [Validators.required, Validators.email]],
      password: ['password', [Validators.required]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.notificationService.showError('Veuillez remplir correctement tous les champs.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => { // La réponse contient {success: boolean, role: UserRole}
        this.isLoading = false;
        this.notificationService.showSuccess(`Connexion réussie en tant que ${response.role} !`);
        this.router.navigateByUrl(this.returnUrl); // Utiliser l'URL de retour
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Erreur de connexion. Veuillez réessayer.';
        this.notificationService.showError(this.errorMessage);
        console.error('Login error:', err);
      }
    });
  }
}