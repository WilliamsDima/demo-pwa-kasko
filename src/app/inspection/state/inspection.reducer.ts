import { createFeature, createReducer, on } from '@ngrx/store';
import { INSPECTION_STEPS, INSPECTION_TIMER_SECONDS } from '../../core/inspection-steps';
import { CapturedPhoto } from '../../core/models/capture-photo.model';
import { cameraActions, captureActions, connectivityActions, sessionActions, submissionActions, timerActions } from './inspection.actions';
import { initialInspectionState, InspectionState } from './inspection.state';

export const inspectionFeature = createFeature({
  name: 'inspection',
  reducer: createReducer(
    initialInspectionState,

    on(sessionActions.started, (state, { vehicle }): InspectionState => ({
      ...initialInspectionState,
      online: state.online,
      vehicle,
      status: 'active',
      timerStartedAt: Date.now(),
    })),

    on(sessionActions.reset, (state): InspectionState => ({
      ...initialInspectionState,
      online: state.online,
    })),

    on(cameraActions.accessRequested, (state): InspectionState => ({
      ...state,
      cameraStatus: 'requesting',
      cameraError: null,
    })),

    on(cameraActions.accessGranted, (state): InspectionState => ({
      ...state,
      cameraStatus: 'granted',
      cameraError: null,
    })),

    on(cameraActions.accessDenied, (state, { error }): InspectionState => ({
      ...state,
      cameraStatus: error.reason === 'no-camera' ? 'unavailable' : 'denied',
      cameraError: error,
    })),

    on(cameraActions.torchToggled, (state, { enabled }): InspectionState => ({
      ...state,
      torchOn: enabled,
    })),

    on(captureActions.photoTaken, (state, { draft }): InspectionState => ({
      ...state,
      pendingPhoto: draft,
    })),

    on(captureActions.photoRetaken, (state): InspectionState => ({
      ...state,
      pendingPhoto: null,
    })),

    on(captureActions.photoConfirmed, (state): InspectionState => {
      const currentStep = INSPECTION_STEPS[state.currentStepIndex];
      if (!state.pendingPhoto || !currentStep) {
        return state;
      }
      const confirmedPhoto: CapturedPhoto = {
        ...state.pendingPhoto,
        stepId: currentStep.id,
        capturedAt: Date.now(),
      };
      return {
        ...state,
        pendingPhoto: null,
        photos: { ...state.photos, [currentStep.id]: confirmedPhoto },
        currentStepIndex: Math.min(state.currentStepIndex + 1, INSPECTION_STEPS.length - 1),
      };
    }),

    on(timerActions.tick, (state, { nowMs }): InspectionState => {
      if (state.timerStartedAt === null || state.status !== 'active') {
        return state;
      }
      const elapsedSeconds = Math.floor((nowMs - state.timerStartedAt) / 1000);
      const remainingSeconds = Math.max(0, INSPECTION_TIMER_SECONDS - elapsedSeconds);
      return { ...state, remainingSeconds };
    }),

    on(timerActions.expired, (state): InspectionState => ({
      ...state,
      status: state.status === 'active' ? 'expired' : state.status,
      remainingSeconds: 0,
    })),

    on(connectivityActions.statusChanged, (state, { online }): InspectionState => ({
      ...state,
      online,
    })),

    on(submissionActions.submitRequested, (state): InspectionState => ({
      ...state,
      submission: { phase: 'uploading', progress: 0, errorMessage: null, reportId: null },
    })),

    on(submissionActions.eventReceived, (state, { event }): InspectionState => {
      if (event.phase === 'success') {
        return {
          ...state,
          submission: { phase: 'success', progress: 100, errorMessage: null, reportId: event.reportId },
        };
      }
      if (event.phase === 'error') {
        return {
          ...state,
          submission: { ...state.submission, phase: 'error', errorMessage: event.message },
        };
      }
      return {
        ...state,
        submission: { ...state.submission, phase: event.phase, progress: event.progress },
      };
    }),

    on(submissionActions.reportAcknowledgedToggled, (state, { acknowledged }): InspectionState => ({
      ...state,
      reportAcknowledged: acknowledged,
    })),
  ),
});
