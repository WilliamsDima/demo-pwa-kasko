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
  protected readonly rotateOverlayDismissed = signal(false);

  protected readonly showCamera = computed(
    () => this.facade.cameraStatus() === 'granted' && !this.facade.allRequiredCaptured(),
  );

  // Memoized by value (not by step object reference), so this only flips when the
  // *required* orientation actually changes between consecutive steps — several
  // steps in a row can share e.g. "landscape" without re-arming the hint.
  protected readonly requiredStepOrientation = computed(
    () => this.facade.currentStepConfig()?.requiredOrientation ?? null,
  );

  protected readonly orientationSatisfied = computed(() => {
    const required = this.requiredStepOrientation();
    return required === null || required === this.orientation();
  });

  protected readonly showRotateOverlay = computed(
    () =>
      this.showCamera() &&
      !this.facade.pendingPhoto() &&
      !this.orientationSatisfied() &&
      !this.rotateOverlayDismissed(),
  );

  protected readonly timeoutVariant = computed<'complete' | 'incomplete'>(() =>
    this.facade.allRequiredCaptured() ? 'complete' : 'incomplete',
  );

  protected readonly showUploadProgress = computed(() => {
    const phase = this.facade.submission().phase;
    return phase === 'uploading' || phase === 'assessing' || phase === 'finalizing';
  });

  constructor() {
    this.facade.requestCameraAccess();
    inject(DestroyRef).onDestroy(() => this.cameraService.stop());

    effect(() => {
      this.requiredStepOrientation();
      this.rotateOverlayDismissed.set(false);
    });

    effect(() => {
      if (this.orientationSatisfied()) {
        this.rotateOverlayDismissed.set(true);
      }
    });

    effect(() => {
      if (this.facade.submission().phase === 'success') {
        void this.router.navigate(['/result']);
      }
    });
  }

  protected async onShutter(): Promise<void> {
    const stepConfig = this.facade.currentStepConfig();
    const cameraViewport = this.cameraViewportRef();
    if (!stepConfig || !cameraViewport) {
      return;
    }
    try {
      const draft = await this.cameraService.captureFrame(cameraViewport.videoElement(), stepConfig.guideAspectRatio);
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
