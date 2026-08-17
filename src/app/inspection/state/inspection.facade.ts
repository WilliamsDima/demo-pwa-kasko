import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { StepConfig } from '../../core/models/inspection-step.model';
import { CapturedPhoto, CapturedPhotoDraft } from '../../core/models/capture-photo.model';
import { CameraAccessError, CameraStatus } from '../../core/models/camera.model';
import { VehicleInfo } from '../../core/models/vehicle.model';
import { cameraActions, captureActions, sessionActions, submissionActions } from './inspection.actions';
import {
  selectAllRequiredCaptured,
  selectCameraError,
  selectCameraStatus,
  selectCapturedCount,
  selectCapturedPhotosList,
  selectCurrentStepConfig,
  selectCurrentStepIndex,
  selectOnline,
  selectPendingPhoto,
  selectRemainingSeconds,
  selectReportAcknowledged,
  selectStatus,
  selectSubmission,
  selectTorchOn,
  selectVehicle,
} from './inspection.selectors';
import { InspectionStatus, SubmissionState } from './inspection.state';

@Injectable({ providedIn: 'root' })
export class InspectionFacade {
  private readonly store = inject(Store);

  readonly status: Signal<InspectionStatus> = toSignal(this.store.select(selectStatus), { requireSync: true });
  readonly vehicle: Signal<VehicleInfo | null> = toSignal(this.store.select(selectVehicle), { requireSync: true });
  readonly currentStepIndex: Signal<number> = toSignal(this.store.select(selectCurrentStepIndex), { requireSync: true });
  readonly currentStepConfig: Signal<StepConfig | null> = toSignal(this.store.select(selectCurrentStepConfig), {
    requireSync: true,
  });
  readonly capturedPhotos: Signal<readonly (CapturedPhoto | null)[]> = toSignal(
    this.store.select(selectCapturedPhotosList),
    { requireSync: true },
  );
  readonly capturedCount: Signal<number> = toSignal(this.store.select(selectCapturedCount), { requireSync: true });
  readonly pendingPhoto: Signal<CapturedPhotoDraft | null> = toSignal(this.store.select(selectPendingPhoto), {
    requireSync: true,
  });
  readonly allRequiredCaptured: Signal<boolean> = toSignal(this.store.select(selectAllRequiredCaptured), {
    requireSync: true,
  });
  readonly remainingSeconds: Signal<number> = toSignal(this.store.select(selectRemainingSeconds), {
    requireSync: true,
  });
  readonly cameraStatus: Signal<CameraStatus> = toSignal(this.store.select(selectCameraStatus), {
    requireSync: true,
  });
  readonly cameraError: Signal<CameraAccessError | null> = toSignal(this.store.select(selectCameraError), {
    requireSync: true,
  });
  readonly torchOn: Signal<boolean> = toSignal(this.store.select(selectTorchOn), { requireSync: true });
  readonly online: Signal<boolean> = toSignal(this.store.select(selectOnline), { requireSync: true });
  readonly submission: Signal<SubmissionState> = toSignal(this.store.select(selectSubmission), {
    requireSync: true,
  });
  readonly reportAcknowledged: Signal<boolean> = toSignal(this.store.select(selectReportAcknowledged), {
    requireSync: true,
  });

  startInspection(vehicle: VehicleInfo): void {
    this.store.dispatch(sessionActions.started({ vehicle }));
  }

  resetInspection(): void {
    this.store.dispatch(sessionActions.reset());
  }

  requestCameraAccess(): void {
    this.store.dispatch(cameraActions.accessRequested());
  }

  toggleTorch(enabled: boolean): void {
    this.store.dispatch(cameraActions.torchToggled({ enabled }));
  }

  capturePhoto(draft: CapturedPhotoDraft): void {
    this.store.dispatch(captureActions.photoTaken({ draft }));
  }

  retakePhoto(): void {
    this.store.dispatch(captureActions.photoRetaken());
  }

  confirmPhoto(): void {
    this.store.dispatch(captureActions.photoConfirmed());
  }

  submit(): void {
    this.store.dispatch(submissionActions.submitRequested());
  }

  toggleReportAcknowledged(acknowledged: boolean): void {
    this.store.dispatch(submissionActions.reportAcknowledgedToggled({ acknowledged }));
  }
}
