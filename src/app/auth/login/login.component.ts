// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // RouterModule pour routerLink si besoin dans le template
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
  errorMessage: string = ''; // Pour afficher l'erreur sous le formulaire

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService // Pour les notifications globales
  ) {}

  ngOnInit(): void {
    // Pré-remplir pour faciliter les tests, tu peux les enlever pour la version finale
    this.loginForm = this.fb.group({
      email: ['test@example.com', [Validators.required, Validators.email]],
      password: ['password', [Validators.required]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Pour afficher les messages d'erreur des champs
      this.notificationService.showError('Veuillez remplir correctement tous les champs.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = ''; // Réinitialiser le message d'erreur
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (isSuccess) => { // isSuccess sera true
        this.isLoading = false;
        this.notificationService.showSuccess('Connexion réussie !');
        // Récupérer l'URL de retour si elle existe, sinon aller à /products
        const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/products';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => { // L'erreur émise par throwError dans le service est capturée ici
        this.isLoading = false;
        this.errorMessage = err.message || 'Erreur de connexion. Veuillez réessayer.'; // Afficher sous le formulaire
        this.notificationService.showError(this.errorMessage); // Et en notification globale
        console.error('Login error:', err);
      }
    });
  }
}