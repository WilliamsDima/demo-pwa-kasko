import { ChangeDetectionStrategy, Component, effect, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-camera-viewport',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './camera-viewport.component.html',
  styleUrl: './camera-viewport.component.scss',
})
export class CameraViewportComponent {
  readonly stream = input<MediaStream | null>(null);
  readonly guideAspectRatio = input.required<number>();

  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  constructor() {
    effect(() => {
      this.videoRef().nativeElement.srcObject = this.stream();
    });
  }

  videoElement(): HTMLVideoElement {
    return this.videoRef().nativeElement;
  }
}
