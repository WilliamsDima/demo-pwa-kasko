import { createSelector } from '@ngrx/store';
import { INSPECTION_STEPS } from '../../core/inspection-steps';
import { inspectionFeature } from './inspection.reducer';

export const {
  selectStatus,
  selectVehicle,
  selectCurrentStepIndex,
  selectPhotos,
  selectPendingPhoto,
  selectRemainingSeconds,
  selectCameraStatus,
  selectCameraError,
  selectTorchOn,
  selectOnline,
  selectSubmission,
  selectReportAcknowledged,
} = inspectionFeature;

export const selectCurrentStepConfig = createSelector(
  selectCurrentStepIndex,
  (currentStepIndex) => INSPECTION_STEPS[currentStepIndex] ?? null,
);

export const selectCapturedPhotosList = createSelector(selectPhotos, (photos) =>
  INSPECTION_STEPS.map((step) => photos[step.id] ?? null),
);

export const selectCapturedCount = createSelector(
  selectPhotos,
  (photos) => INSPECTION_STEPS.filter((step) => Boolean(photos[step.id])).length,
);

export const selectAllRequiredCaptured = createSelector(
  selectCapturedCount,
  (capturedCount) => capturedCount === INSPECTION_STEPS.length,
);
