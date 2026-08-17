import { StepId } from '../../core/models/inspection-step.model';
import { CapturedPhoto, CapturedPhotoDraft } from '../../core/models/capture-photo.model';
import { VehicleInfo } from '../../core/models/vehicle.model';
import { CameraAccessError, CameraStatus } from '../../core/models/camera.model';
import { SubmissionPhase } from '../../core/models/upload.model';
import { INSPECTION_TIMER_SECONDS } from '../../core/inspection-steps';

export type InspectionStatus = 'idle' | 'active' | 'expired';

export interface SubmissionState {
  readonly phase: SubmissionPhase;
  readonly progress: number;
  readonly errorMessage: string | null;
  readonly reportId: string | null;
}

export interface InspectionState {
  readonly status: InspectionStatus;
  readonly vehicle: VehicleInfo | null;
  readonly currentStepIndex: number;
  readonly photos: Readonly<Partial<Record<StepId, CapturedPhoto>>>;
  readonly pendingPhoto: CapturedPhotoDraft | null;
  readonly timerStartedAt: number | null;
  readonly remainingSeconds: number;
  readonly cameraStatus: CameraStatus;
  readonly cameraError: CameraAccessError | null;
  readonly torchOn: boolean;
  readonly online: boolean;
  readonly submission: SubmissionState;
  readonly reportAcknowledged: boolean;
}

export const initialInspectionState: InspectionState = {
  status: 'idle',
  vehicle: null,
  currentStepIndex: 0,
  photos: {},
  pendingPhoto: null,
  timerStartedAt: null,
  remainingSeconds: INSPECTION_TIMER_SECONDS,
  cameraStatus: 'idle',
  cameraError: null,
  torchOn: false,
  online: true,
  submission: { phase: 'idle', progress: 0, errorMessage: null, reportId: null },
  reportAcknowledged: false,
};
