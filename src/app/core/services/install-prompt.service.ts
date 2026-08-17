import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { BeforeInstallPromptEvent } from '../models/pwa.model';

@Injectable({ providedIn: 'root' })
export class InstallPromptService {
  readonly isIos: boolean = /iphone|ipad|ipod/i.test(navigator.userAgent);
  readonly isStandalone: boolean = window.matchMedia('(display-mode: standalone)').matches;

  private readonly deferredPromptSubject = new BehaviorSubject<BeforeInstallPromptEvent | null>(null);
  readonly canPromptInstall$: Observable<boolean> = this.deferredPromptSubject.pipe(map((event) => event !== null));

  constructor() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPromptSubject.next(event as BeforeInstallPromptEvent);
    });
    window.addEventListener('appinstalled', () => {
      this.deferredPromptSubject.next(null);
    });
  }

  async promptInstall(): Promise<void> {
    const promptEvent = this.deferredPromptSubject.value;
    if (!promptEvent) {
      return;
    }
    await promptEvent.prompt();
    this.deferredPromptSubject.next(null);
  }
}
