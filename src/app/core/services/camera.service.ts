import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CameraAccessError } from '../models/camera.model';
import { CapturedPhotoDraft } from '../models/capture-photo.model';

const MAX_PHOTO_SIDE_PX = 1280;
const JPEG_QUALITY = 0.85;

interface CropRegion {
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
}

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

  async captureFrame(video: HTMLVideoElement, aspectRatio: number): Promise<CapturedPhotoDraft> {
    const cropRegion = this.computeCropRegion(video.videoWidth, video.videoHeight, aspectRatio);
    const scale = Math.min(1, MAX_PHOTO_SIDE_PX / Math.max(cropRegion.sw, cropRegion.sh));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropRegion.sw * scale);
    canvas.height = Math.round(cropRegion.sh * scale);

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context is not available');
    }

    context.drawImage(
      video,
      cropRegion.sx,
      cropRegion.sy,
      cropRegion.sw,
      cropRegion.sh,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const blob = await this.canvasToBlob(canvas);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    return { dataUrl, blob };
  }

  private computeCropRegion(videoWidth: number, videoHeight: number, aspectRatio: number): CropRegion {
    const videoAspect = videoWidth / videoHeight;

    if (videoAspect > aspectRatio) {
      const sh = videoHeight;
      const sw = sh * aspectRatio;
      return { sx: (videoWidth - sw) / 2, sy: 0, sw, sh };
    }

    const sw = videoWidth;
    const sh = sw / aspectRatio;
    return { sx: 0, sy: (videoHeight - sh) / 2, sw, sh };
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
