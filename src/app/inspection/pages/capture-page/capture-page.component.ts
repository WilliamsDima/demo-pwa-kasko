import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CameraService } from '../../../core/services/camera.service';
import { OrientationService } from '../../../core/services/orientation.service';
import { INSPECTION_STEPS } from '../../../core/inspection-steps';
import { InspectionFacade } from '../../state/inspection.facade';
import { CameraViewportComponent } from '../../components/camera-viewport/camera-viewport.component';
import { StepHeaderComponent } from '../../components/step-header/step-header.component';
import { CaptureControlsComponent } from '../../components/capture-controls/capture-controls.component';
import { PhotoReviewComponent } from '../../components/photo-review/photo-review.component';
import { PhotoThumbnailsComponent } from '../../components/photo-thumbnails/photo-thumbnails.component';
import { RotateDeviceOverlayComponent } from '../../components/rotate-device-overlay/rotate-device-overlay.component';
import { PermissionDeniedPanelComponent } from '../../components/permission-denied-panel/permission-denied-panel.component';
import { InfoModalComponent } from '../../components/info-modal/info-modal.component';
import { ConfirmActionModalComponent } from '../../components/confirm-action-modal/confirm-action-modal.component';
import { UploadProgressPageComponent } from '../../components/upload-progress-page/upload-progress-page.component';
import { ErrorPanelComponent } from '../../components/error-panel/error-panel.component';

const PORTRAIT_GUIDE_RATIO = 3 / 4;
const LANDSCAPE_GUIDE_RATIO = 4 / 3;

@Component({
  selector: 'app-capture-page',
  imports: [
    CameraViewportComponent,
    StepHeaderComponent,
    CaptureControlsComponent,
    PhotoReviewComponent,
    PhotoThumbnailsComponent,
    RotateDeviceOverlayComponent,
    PermissionDeniedPanelComponent,
    InfoModalComponent,
    ConfirmActionModalComponent,
    UploadProgressPageComponent,
    ErrorPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './capture-page.component.html',
  styleUrl: './capture-page.component.scss',
})
export class CapturePageComponent {
  private readonly cameraService = inject(CameraService);
  private readonly orientationService = inject(OrientationService);
  private readonly router = inject(Router);
  protected readonly facade = inject(InspectionFacade);

  protected readonly totalSteps = INSPECTION_STEPS.length;

  private readonly cameraViewportRef = viewChild<CameraViewportComponent>('cameraViewport');

  protected readonly cameraStream = toSignal(this.cameraService.stream$, { initialValue: null });
  protected readonly torchAvailable = toSignal(this.cameraService.torchSupported$, { initialValue: false });
  protected readonly orientation = toSignal(this.orientationService.orientation$, { initialValue: 'portrait' as const });

  protected readonly exitConfirmVisible = signal(false);
  protected readonly hintVisible = signal(false);
  protected readonly captureErrorVisible = signal(false);
  protected readonly rotateHintDismissed = signal(false);

  protected readonly showCamera = computed(
    () => this.facade.cameraStatus() === 'granted' && !this.facade.allRequiredCaptured(),
  );

  // Driven purely by the phone's *current* physical orientation — the guide frame is
  // just a live preview of what you'll get, not a per-step requirement anymore.
  protected readonly guideAspectRatio = computed(() =>
    this.orientation() === 'landscape' ? LANDSCAPE_GUIDE_RATIO : PORTRAIT_GUIDE_RATIO,
  );

  // Every step can be shot in either orientation — it's the user's call. The rotate
  // hint is just a one-time "did you know" tip shown on the very first step, not a
  // reaction to any per-step mismatch.
  protected readonly showRotateHint = computed(
    () =>
      this.showCamera() &&
      !this.facade.pendingPhoto() &&
      this.facade.currentStepIndex() === 0 &&
      !this.rotateHintDismissed(),
  );

  protected readonly timeoutVariant = computed<'complete' | 'incomplete'>(() =>
    this.facade.allRequiredCaptured() ? 'complete' : 'incomplete',
  );

  protected readonly showUploadProgress = computed(() => {
    const phase = this.facade.submission().phase;
    return phase === 'uploading' || phase === 'assessing' || phase === 'finalizing';
  });

  private readonly initialOrientation = this.orientation();

  constructor() {
    this.facade.requestCameraAccess();
    inject(DestroyRef).onDestroy(() => this.cameraService.stop());

    // Also dismiss the one-time hint the moment the user actually rotates the
    // phone — they clearly got the idea, no need to keep it around after that.
    effect(() => {
      if (this.orientation() !== this.initialOrientation) {
        this.rotateHintDismissed.set(true);
      }
    });

    effect(() => {
      if (this.facade.submission().phase === 'success') {
        void this.router.navigate(['/result']);
      }
    });
  }

  protected async onShutter(): Promise<void> {
    const cameraViewport = this.cameraViewportRef();
    if (!cameraViewport) {
      return;
    }
    try {
      const draft = await this.cameraService.captureFrame(cameraViewport.videoElement());
      this.facade.capturePhoto(draft);
    } catch {
      this.captureErrorVisible.set(true);
    }
  }

  protected onToggleTorch(): void {
    this.facade.toggleTorch(!this.facade.torchOn());
  }

  protected onRestartFlow(): void {
    this.facade.resetInspection();
    void this.router.navigate(['/']);
  }

  protected onReportProblem(): void {
    console.info('Проблема отправлена в поддержку (демо-заглушка)');
  }
}
