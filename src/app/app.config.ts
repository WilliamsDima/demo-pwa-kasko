import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { UPLOAD_ENDPOINT } from './core/tokens/upload-endpoint.token';
import { HttpInspectionUploadService, InspectionUploadService } from './core/services/inspection-upload.service';
import { inspectionFeature } from './inspection/state/inspection.reducer';
import { InspectionEffects } from './inspection/state/inspection.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideStore(),
    provideState(inspectionFeature),
    provideEffects(InspectionEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production && !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: UPLOAD_ENDPOINT, useValue: environment.uploadEndpoint },
    { provide: InspectionUploadService, useClass: HttpInspectionUploadService },
  ],
};
