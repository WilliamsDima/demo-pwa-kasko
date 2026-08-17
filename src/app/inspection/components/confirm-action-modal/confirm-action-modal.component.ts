import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalShellComponent } from '../modal-shell/modal-shell.component';

export type ConfirmModalIcon = 'warning' | 'danger';

@Component({
  selector: 'app-confirm-action-modal',
  imports: [ModalShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-action-modal.component.html',
  styleUrl: './confirm-action-modal.component.scss',
})
export class ConfirmActionModalComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly primaryLabel = input.required<string>();
  readonly secondaryLabel = input<string | null>(null);
  readonly icon = input<ConfirmModalIcon>('warning');
  readonly showCloseButton = input(true);

  readonly primary = output<void>();
  readonly secondary = output<void>();
  readonly close = output<void>();
}
