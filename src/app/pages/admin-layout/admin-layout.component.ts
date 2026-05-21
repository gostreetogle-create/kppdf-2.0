import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/auth/auth.service';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, AvatarModule, TooltipModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  readonly authStore = inject(AuthStore);

  readonly navItems = [
    { path: '/dashboard', label: 'Дашборд', icon: 'pi pi-home' },
    { path: '/products', label: 'Товары', icon: 'pi pi-box' },
    { path: '/counterparties', label: 'Контрагенты', icon: 'pi pi-building' },
    { path: '/kp', label: 'КП', icon: 'pi pi-file' },
    { path: '/orders', label: 'Заказы', icon: 'pi pi-shopping-cart' },
    { path: '/settings', label: 'Настройки', icon: 'pi pi-cog' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
