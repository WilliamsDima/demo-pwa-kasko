import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  exhaustMap,
  filter,
  from,
  interval,
  map,
  of,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { CameraService } from '../../core/services/camera.service';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { InspectionUploadService } from '../../core/services/inspection-upload.service';
import { CameraAccessError } from '../../core/models/camera.model';
import { CapturedPhoto } from '../../core/models/capture-photo.model';
import {
  cameraActions,
  connectivityActions,
  sessionActions,
  submissionActions,
  timerActions,
} from './inspection.actions';
import {
  selectCapturedPhotosList,
  selectRemainingSeconds,
  selectVehicle,
} from './inspection.selectors';

@Injectable()
export class InspectionEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly cameraService = inject(CameraService);
  private readonly connectivityService = inject(ConnectivityService);
  private readonly uploadService = inject(InspectionUploadService);

  readonly runTimer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sessionActions.started),
      exhaustMap(() =>
        interval(1000).pipe(
          map(() => timerActions.tick({ nowMs: Date.now() })),
          takeUntil(this.actions$.pipe(ofType(sessionActions.reset, timerActions.expired)))
        )
      )
    )
  );

  readonly expireTimer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(timerActions.tick),
      withLatestFrom(this.store.select(selectRemainingSeconds)),
      filter(([, remainingSeconds]) => remainingSeconds <= 0),
      map(() => timerActions.expired())
    )
  );

  readonly requestCameraAccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cameraActions.accessRequested),
      exhaustMap(() =>
        from(this.cameraService.requestAccess()).pipe(
          map(() => cameraActions.accessGranted()),
          catchError((error: unknown) =>
            of(cameraActions.accessDenied({ error: error as CameraAccessError }))
          )
        )
      )
    )
  );

  readonly applyTorch$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cameraActions.torchToggled),
        tap(({ enabled }) => {
          void this.cameraService.setTorch(enabled);
        })
      ),
    { dispatch: false }
  );

  readonly stopCameraOnReset$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(sessionActions.reset),
        tap(() => this.cameraService.stop())
      ),
    { dispatch: false }
  );

  readonly watchConnectivity$ = createEffect(() =>
    this.connectivityService.online$.pipe(
      map((online) => connectivityActions.statusChanged({ online }))
    )
  );

  readonly submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submissionActions.submitRequested),
      withLatestFrom(this.store.select(selectCapturedPhotosList), this.store.select(selectVehicle)),
      exhaustMap(([action, photosList, vehicle]) => {
        const photos = photosList.filter((photo): photo is CapturedPhoto => photo !== null);
        if (!vehicle) {
          return of(
            submissionActions.eventReceived({
              event: { phase: 'error', message: 'Не удалось определить автомобиль осмотра' },
            })
          );
        }

        if (action.isMock) {
          return this.uploadService
            .mockUpload(photos, vehicle)
            .pipe(map((event) => submissionActions.eventReceived({ event })));
        }
        return this.uploadService
          .upload(photos, vehicle)
          .pipe(map((event) => submissionActions.eventReceived({ event })));
      })
    )
  );
}
