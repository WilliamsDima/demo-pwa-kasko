import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CameraAccessError } from '../models/camera.model';
import { CapturedPhotoDraft } from '../models/capture-photo.model';

const MAX_PHOTO_SIDE_PX = 1920;
const JPEG_QUALITY = 0.9;

@Injectable({ providedIn: 'root' })
export class CameraService {
  private readonly streamSubject = new BehaviorSubject<MediaStream | null>(null);
  readonly stream$: Observable<MediaStream | null> = this.streamSubject.asObservable();

  private readonly torchSupportedSubject = new BehaviorSubject<boolean>(false);
  readonly torchSupported$: Observable<boolean> = this.torchSupportedSubject.asObservable();

  async requestAccess(): Promise<void> {
    this.stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      this.streamSubject.next(stream);
      this.torchSupportedSubject.next(this.detectTorchSupport(stream));
    } catch (error: unknown) {
      this.streamSubject.next(null);
      this.torchSupportedSubject.next(false);
      throw this.toCameraAccessError(error);
    }
  }

  stop(): void {
    const currentStream = this.streamSubject.value;
    currentStream?.getTracks().forEach((track) => track.stop());
    this.streamSubject.next(null);
    this.torchSupportedSubject.next(false);
  }

  async setTorch(enabled: boolean): Promise<void> {
    const [videoTrack] = this.streamSubject.value?.getVideoTracks() ?? [];
    if (!videoTrack) {
      return;
    }
    try {
      const torchConstraint = { advanced: [{ torch: enabled }] } as unknown as MediaTrackConstraints;
      await videoTrack.applyConstraints(torchConstraint);
    } catch {
      // Устройство заявило поддержку torch в capabilities, но применить constraint не удалось —
      // молча игнорируем, кнопка уже скрыта для устройств без torchSupported$.
    }
  }

  async captureFrame(video: HTMLVideoElement): Promise<CapturedPhotoDraft> {
    const scale = Math.min(1, MAX_PHOTO_SIDE_PX / Math.max(video.videoWidth, video.videoHeight));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context is not available');
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await this.canvasToBlob(canvas);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    return { dataUrl, blob };
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode captured photo'))),
        'image/jpeg',
        JPEG_QUALITY,
      );
    });
  }

  private detectTorchSupport(stream: MediaStream): boolean {
    const [videoTrack] = stream.getVideoTracks();
    if (!videoTrack || typeof videoTrack.getCapabilities !== 'function') {
      return false;
    }
    const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
    return Boolean(capabilities.torch);
  }

  private toCameraAccessError(error: unknown): CameraAccessError {
    const domError = error instanceof DOMException ? error : null;

    if (domError?.name === 'NotAllowedError' || domError?.name === 'PermissionDeniedError') {
      return { reason: 'permission-denied', message: 'Доступ к камере запрещён' };
    }
    if (domError?.name === 'NotFoundError' || domError?.name === 'OverconstrainedError') {
      return { reason: 'no-camera', message: 'Камера не найдена на устройстве' };
    }
    return { reason: 'unknown', message: 'Не удалось получить доступ к камере' };
  }
}
