import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectStatus, selectSubmission } from '../state/inspection.selectors';

export const captureActiveGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectStatus).pipe(
    take(1),
    map((status) => (status === 'idle' ? router.parseUrl('/') : true)),
  );
};

export const resultReadyGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectSubmission).pipe(
    take(1),
    map((submission) => (submission.phase === 'success' ? true : router.parseUrl('/'))),
  );
};
