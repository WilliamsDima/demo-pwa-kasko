import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-capture-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './capture-controls.component.html',
  styleUrl: './capture-controls.component.scss',
})
export class CaptureControlsComponent {
  readonly torchAvailable = input(false);
  readonly torchOn = input(false);

  readonly shutter = output<void>();
  readonly toggleTorch = output<void>();
  readonly help = output<void>();
}
