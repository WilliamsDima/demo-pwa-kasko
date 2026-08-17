import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalShellComponent } from '../modal-shell/modal-shell.component';

@Component({
  selector: 'app-info-modal',
  imports: [ModalShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.scss',
})
export class InfoModalComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly ctaLabel = input('Понятно');

  readonly close = output<void>();
}
