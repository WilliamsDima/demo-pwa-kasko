export type CameraStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export type CameraErrorReason = 'permission-denied' | 'no-camera' | 'unknown';

export interface CameraAccessError {
  readonly reason: CameraErrorReason;
  readonly message: string;
}
