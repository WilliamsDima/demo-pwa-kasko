import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-photo-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photo-review.component.html',
  styleUrl: './photo-review.component.scss',
})
export class PhotoReviewComponent {
  readonly photoDataUrl = input.required<string>();

  readonly retake = output<void>();
  readonly confirm = output<void>();
}
