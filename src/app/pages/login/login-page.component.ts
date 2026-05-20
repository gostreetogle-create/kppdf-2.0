import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../core/auth/auth.service';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly loading = this.authStore.loading;

  onSubmit(): void {
    const user = this.username().trim();
    const pass = this.password().trim();

    if (!user || !pass) {
      this.errorMessage.set('Введите логин и пароль');
      return;
    }

    this.errorMessage.set(null);

    this.authService.login({ username: user, password: pass }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: { message?: string }) => {
        this.errorMessage.set(err.message ?? 'Ошибка входа');
      },
    });
  }
}
