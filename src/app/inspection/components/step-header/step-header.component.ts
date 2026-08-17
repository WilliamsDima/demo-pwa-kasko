import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormatCountdownPipe } from '../../pipes/format-countdown.pipe';

const LOW_TIME_THRESHOLD_SECONDS = 60;

@Component({
  selector: 'app-step-header',
  imports: [FormatCountdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-header.component.html',
  styleUrl: './step-header.component.scss',
})
export class StepHeaderComponent {
  readonly stepNumber = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly title = input.required<string>();
  readonly remainingSeconds = input.required<number>();
  readonly helpAvailable = input(false);

  readonly close = output<void>();
  readonly help = output<void>();

  readonly isLowTime = computed(() => this.remainingSeconds() <= LOW_TIME_THRESHOLD_SECONDS);
}
