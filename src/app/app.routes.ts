import { Routes } from '@angular/router';
import { captureActiveGuard, resultReadyGuard } from './inspection/guards/inspection-active.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inspection/pages/intro-page/intro-page.component').then((m) => m.IntroPageComponent),
  },
  {
    path: 'capture',
    canActivate: [captureActiveGuard],
    loadComponent: () =>
      import('./inspection/pages/capture-page/capture-page.component').then((m) => m.CapturePageComponent),
  },
  {
    path: 'result',
    canActivate: [resultReadyGuard],
    loadComponent: () =>
      import('./inspection/pages/result-page/result-page.component').then((m) => m.ResultPageComponent),
  },
  { path: '**', redirectTo: '' },
];
