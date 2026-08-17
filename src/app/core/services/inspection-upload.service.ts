import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, of, concat, delay, catchError, concatMap } from 'rxjs';
import { CapturedPhoto } from '../models/capture-photo.model';
import { VehicleInfo } from '../models/vehicle.model';
import { UploadErrorEvent, UploadEvent, UploadProgressEvent, UploadSuccessEvent } from '../models/upload.model';
import { UPLOAD_ENDPOINT } from '../tokens/upload-endpoint.token';

const UPLOAD_PHASE_MAX_PROGRESS = 70;

@Injectable()
export abstract class InspectionUploadService {
  abstract upload(photos: readonly CapturedPhoto[], vehicle: VehicleInfo): Observable<UploadEvent>;
}

@Injectable()
export class HttpInspectionUploadService implements InspectionUploadService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = inject(UPLOAD_ENDPOINT);

  upload(photos: readonly CapturedPhoto[], vehicle: VehicleInfo): Observable<UploadEvent> {
    const formData = this.buildFormData(photos, vehicle);

    return this.http
      .post(this.endpoint, formData, { reportProgress: true, observe: 'events' })
      .pipe(
        concatMap((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            return of(this.toProgressEvent(event));
          }
          if (event.type === HttpEventType.Response) {
            return this.simulateAssessmentStages();
          }
          return of();
        }),
        catchError((error: unknown) => this.toErrorEvent(error)),
      );
  }

  private buildFormData(photos: readonly CapturedPhoto[], vehicle: VehicleInfo): FormData {
    const formData = new FormData();
    formData.append('vehicle', JSON.stringify(vehicle));
    photos.forEach((photo) => {
      formData.append(`photo_${photo.stepId}`, photo.blob, `${photo.stepId}.jpg`);
    });
    return formData;
  }

  private toProgressEvent(event: HttpProgressEvent): UploadProgressEvent {
    const total = event.total ?? event.loaded;
    const ratio = total > 0 ? event.loaded / total : 0;
    return { phase: 'uploading', progress: Math.round(ratio * UPLOAD_PHASE_MAX_PROGRESS) };
  }

  private simulateAssessmentStages(): Observable<UploadEvent> {
    const assessingProgress: readonly UploadProgressEvent[] = [78, 88, 95].map((progress) => ({
      phase: 'assessing',
      progress,
    }));
    const finalizingProgress: readonly UploadProgressEvent[] = [97, 99].map((progress) => ({
      phase: 'finalizing',
      progress,
    }));
    const success: UploadSuccessEvent = { phase: 'success', reportId: this.generateReportId() };

    return concat(
      ...assessingProgress.map((step) => of(step).pipe(delay(450))),
      ...finalizingProgress.map((step) => of(step).pipe(delay(300))),
      of(success).pipe(delay(300)),
    );
  }

  private generateReportId(): string {
    return `INS-${Date.now().toString(36).toUpperCase()}`;
  }

  private toErrorEvent(error: unknown): Observable<UploadErrorEvent> {
    const message =
      error instanceof HttpErrorResponse
        ? 'Не удалось отправить фото на сервер'
        : 'Что-то пошло не так';
    return of({ phase: 'error', message });
  }
}
