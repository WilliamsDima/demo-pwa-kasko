import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-error-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-panel.component.html',
  styleUrl: './error-panel.component.scss',
})
export class ErrorPanelComponent {
  readonly report = output<void>();
  readonly restart = output<void>();
}
