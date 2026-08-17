export type StepId =
  | 'vin'
  | 'windshield'
  | 'windshieldLogo'
  | 'frontLeft'
  | 'frontRight'
  | 'backRight'
  | 'backLeft'
  | 'odometer';

export type DeviceOrientation = 'portrait' | 'landscape';

export type StepCategory = 'vin' | 'exterior' | 'windshield' | 'odometer';

export interface StepHint {
  readonly title: string;
  readonly description: string;
}

export interface StepConfig {
  readonly id: StepId;
  readonly order: number;
  readonly title: string;
  readonly category: StepCategory;
  readonly requiredOrientation: DeviceOrientation;
  readonly guideAspectRatio: number;
  readonly hint: StepHint;
}
