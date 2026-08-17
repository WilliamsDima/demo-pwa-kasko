import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CapturedPhoto } from '../../../core/models/capture-photo.model';

@Component({
  selector: 'app-photo-thumbnails',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photo-thumbnails.component.html',
  styleUrl: './photo-thumbnails.component.scss',
})
export class PhotoThumbnailsComponent {
  readonly photos = input.required<readonly (CapturedPhoto | null)[]>();
}
