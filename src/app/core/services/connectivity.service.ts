import { Injectable } from '@angular/core';
import { Observable, fromEvent, merge, map, startWith, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly online$: Observable<boolean> = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false)),
  ).pipe(
    startWith(navigator.onLine),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}
