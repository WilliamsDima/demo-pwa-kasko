export type SubmissionPhase =
  | 'idle'
  | 'uploading'
  | 'assessing'
  | 'finalizing'
  | 'success'
  | 'error';

export interface UploadProgressEvent {
  readonly phase: Exclude<SubmissionPhase, 'idle' | 'success' | 'error'>;
  readonly progress: number;
}

export interface UploadSuccessEvent {
  readonly phase: 'success';
  readonly reportId: string;
}

export interface UploadErrorEvent {
  readonly phase: 'error';
  readonly message: string;
}

export type UploadEvent = UploadProgressEvent | UploadSuccessEvent | UploadErrorEvent;
