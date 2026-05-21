import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';

/**
 * Структурная директива: *ifPermissions="['order.edit']"
 * Показывает содержимое, только если у пользователя есть хотя бы одно из указанных разрешений.
 */
@Directive({
  selector: '[appIfPermissions]',
  standalone: true,
})
export class IfPermissionsDirective implements OnDestroy {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);

  private hasView = false;

  @Input() set appIfPermissions(codes: string[]) {
    // Отписываемся от предыдущего effect при смене codes
    this._effectRef?.destroy();

    this._effectRef = effect(() => {
      const user = this.authStore.user();
      const userPermissions = user?.permissions ?? [];
      const granted = codes.some((c) => userPermissions.includes(c));
      if (granted && !this.hasView) {
        this.vcr.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!granted && this.hasView) {
        this.vcr.clear();
        this.hasView = false;
      }
    });
  }

  private _effectRef: ReturnType<typeof effect> | null = null;

  ngOnDestroy(): void {
    this._effectRef?.destroy();
  }
}
