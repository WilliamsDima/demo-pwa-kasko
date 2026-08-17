import { Injectable } from '@angular/core';
import { Observable, fromEvent, merge, startWith, shareReplay, map, NEVER } from 'rxjs';
import { DeviceOrientation } from '../models/inspection-step.model';

@Injectable({ providedIn: 'root' })
export class OrientationService {
  readonly orientation$: Observable<DeviceOrientation> = this.createOrientationStream();

  private createOrientationStream(): Observable<DeviceOrientation> {
    const portraitQuery = window.matchMedia('(orientation: portrait)');
    const mediaChange$ = fromEvent<MediaQueryListEvent>(portraitQuery, 'change');
    const orientationApiChange$ = screen.orientation ? fromEvent(screen.orientation, 'change') : NEVER;

    return merge(mediaChange$, orientationApiChange$).pipe(
      map(() => this.readOrientation(portraitQuery)),
      startWith(this.readOrientation(portraitQuery)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  private readOrientation(portraitQuery: MediaQueryList): DeviceOrientation {
    return portraitQuery.matches ? 'portrait' : 'landscape';
  }
}
