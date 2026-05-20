import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  readonly authStore = inject(AuthStore);

  readonly navItems = [
    { path: '/dashboard', label: 'Дашборд', icon: '📊' },
    { path: '/products', label: 'Товары', icon: '📦' },
    { path: '/counterparties', label: 'Контрагенты', icon: '🏢' },
    { path: '/kp', label: 'КП', icon: '📄' },
    { path: '/settings', label: 'Настройки', icon: '⚙️' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
