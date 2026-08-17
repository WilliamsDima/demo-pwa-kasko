import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CameraErrorReason } from '../../../core/models/camera.model';

@Component({
  selector: 'app-permission-denied-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permission-denied-panel.component.html',
  styleUrl: './permission-denied-panel.component.scss',
})
export class PermissionDeniedPanelComponent {
  readonly reason = input<CameraErrorReason>('permission-denied');

  readonly title = computed(() =>
    this.reason() === 'no-camera' ? 'Камера не найдена' : 'Нет доступа к камере',
  );

  readonly description = computed(() =>
    this.reason() === 'no-camera'
      ? 'На этом устройстве не удалось найти камеру. Проверьте подключение и повторите попытку.'
      : 'Откройте настройки браузера → Разрешения сайта → Камера → Разрешить, затем повторите попытку.',
  );

  readonly retry = output<void>();
  readonly close = output<void>();
}
