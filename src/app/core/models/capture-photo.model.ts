import { StepId } from './inspection-step.model';

export interface CapturedPhotoDraft {
  readonly dataUrl: string;
  readonly blob: Blob;
}

export interface CapturedPhoto extends CapturedPhotoDraft {
  readonly stepId: StepId;
  readonly capturedAt: number;
}
