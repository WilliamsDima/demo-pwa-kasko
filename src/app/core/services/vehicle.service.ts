import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { VehicleInfo } from '../models/vehicle.model';

const DEADLINE_DAYS_AHEAD = 7;

@Injectable({ providedIn: 'root' })
export class VehicleService {
  getCurrentInspectionVehicle(): Observable<VehicleInfo> {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + DEADLINE_DAYS_AHEAD);

    const vehicle: VehicleInfo = {
      make: 'Mercedes',
      model: 'SLS',
      year: 2022,
      plate: 'M171MT 777',
      deadlineIso: deadline.toISOString(),
    };

    return of(vehicle).pipe(delay(300));
  }
}
