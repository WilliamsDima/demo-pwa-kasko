import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { VehicleInfo } from '../../core/models/vehicle.model';
import { CameraAccessError } from '../../core/models/camera.model';
import { CapturedPhotoDraft } from '../../core/models/capture-photo.model';
import { UploadEvent } from '../../core/models/upload.model';

export const sessionActions = createActionGroup({
  source: 'Inspection/Session',
  events: {
    Started: props<{ vehicle: VehicleInfo }>(),
    Reset: emptyProps(),
  },
});

export const cameraActions = createActionGroup({
  source: 'Inspection/Camera',
  events: {
    'Access Requested': emptyProps(),
    'Access Granted': emptyProps(),
    'Access Denied': props<{ error: CameraAccessError }>(),
    'Torch Toggled': props<{ enabled: boolean }>(),
  },
});

export const captureActions = createActionGroup({
  source: 'Inspection/Capture',
  events: {
    'Photo Taken': props<{ draft: CapturedPhotoDraft }>(),
    'Photo Retaken': emptyProps(),
    'Photo Confirmed': emptyProps(),
  },
});

export const timerActions = createActionGroup({
  source: 'Inspection/Timer',
  events: {
    Tick: props<{ nowMs: number }>(),
    Expired: emptyProps(),
  },
});

export const connectivityActions = createActionGroup({
  source: 'Inspection/Connectivity',
  events: {
    'Status Changed': props<{ online: boolean }>(),
  },
});

export const submissionActions = createActionGroup({
  source: 'Inspection/Submission',
  events: {
    'Submit Requested': emptyProps(),
    'Event Received': props<{ event: UploadEvent }>(),
    'Report Acknowledged Toggled': props<{ acknowledged: boolean }>(),
  },
});
