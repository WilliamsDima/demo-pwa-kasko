import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-rotate-device-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rotate-device-overlay.component.html',
  styleUrl: './rotate-device-overlay.component.scss',
})
export class RotateDeviceOverlayComponent {
  readonly dismiss = output<void>();
}
