import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { InstallPromptService } from '../../../core/services/install-prompt.service';
import { INSPECTION_STEPS, STEP_CATEGORY_LABELS } from '../../../core/inspection-steps';
import { StepCategory } from '../../../core/models/inspection-step.model';
import { InspectionFacade } from '../../state/inspection.facade';
import { InfoModalComponent } from '../../components/info-modal/info-modal.component';
import { BUILD_INFO } from '../../../core/build-info';

interface ChecklistItem {
  readonly label: string;
  readonly count: number;
}

@Component({
  selector: 'app-intro-page',
  imports: [DatePipe, InfoModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './intro-page.component.html',
  styleUrl: './intro-page.component.scss',
})
export class IntroPageComponent {
  private readonly vehicleService = inject(VehicleService);
  private readonly facade = inject(InspectionFacade);
  private readonly router = inject(Router);
  protected readonly installPrompt = inject(InstallPromptService);

  protected readonly totalPhotos = INSPECTION_STEPS.length;
  protected readonly checklist: readonly ChecklistItem[] = this.buildChecklist();
  protected readonly buildCommit = BUILD_INFO.commit;
  protected readonly buildDate = new Date(BUILD_INFO.builtAt);

  protected readonly vehicle = toSignal(this.vehicleService.getCurrentInspectionVehicle(), {
    initialValue: null,
  });

  protected readonly canPromptInstall = toSignal(this.installPrompt.canPromptInstall$, { initialValue: false });
  protected readonly showSetupHint = signal(false);
  protected readonly showIosInstallHint = signal(false);

  protected readonly deadlineDate = computed(() => {
    const vehicle = this.vehicle();
    return vehicle ? new Date(vehicle.deadlineIso) : null;
  });

  private buildChecklist(): readonly ChecklistItem[] {
    const counts = new Map<StepCategory, number>();
    INSPECTION_STEPS.forEach((step) => {
      counts.set(step.category, (counts.get(step.category) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([category, count]) => ({
      label: STEP_CATEGORY_LABELS[category],
      count,
    }));
  }

  protected startInspection(): void {
    const vehicle = this.vehicle();
    if (!vehicle) {
      return;
    }
    this.facade.startInspection(vehicle);
    void this.router.navigate(['/capture']);
  }

  protected requestInstall(): void {
    if (this.installPrompt.isIos) {
      this.showIosInstallHint.set(true);
      return;
    }
    void this.installPrompt.promptInstall();
  }
}
