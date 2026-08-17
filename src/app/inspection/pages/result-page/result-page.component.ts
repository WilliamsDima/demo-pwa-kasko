import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { INSPECTION_STEPS } from '../../../core/inspection-steps';
import { InspectionFacade } from '../../state/inspection.facade';
import { ConfirmActionModalComponent } from '../../components/confirm-action-modal/confirm-action-modal.component';

@Component({
  selector: 'app-result-page',
  imports: [DatePipe, ConfirmActionModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.scss',
})
export class ResultPageComponent {
  protected readonly facade = inject(InspectionFacade);
  private readonly router = inject(Router);

  protected readonly restartConfirmVisible = signal(false);
  protected readonly confirmed = signal(false);

  protected onAcknowledgedChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.facade.toggleReportAcknowledged(checked);
  }

  protected onConfirmResult(): void {
    this.confirmed.set(true);
  }

  protected onRestartClick(): void {
    // Once the result is confirmed there's nothing left to warn about losing —
    // the inspection is already submitted and acknowledged.
    if (this.confirmed()) {
      this.onRestartConfirmed();
      return;
    }
    this.restartConfirmVisible.set(true);
  }

  protected onRestartConfirmed(): void {
    this.facade.resetInspection();
    void this.router.navigate(['/']);
  }

  protected downloadReport(): void {
    const vehicle = this.facade.vehicle();
    const submission = this.facade.submission();
    if (!vehicle) {
      return;
    }

    const stepLines = INSPECTION_STEPS.map((step) => `— ${step.title}: сфотографировано`).join('\n');
    const reportText = [
      'АКТ ОСМОТРА АВТОМОБИЛЯ',
      `Номер отчёта: ${submission.reportId ?? '—'}`,
      `Автомобиль: ${vehicle.make} ${vehicle.model}, ${vehicle.year}`,
      `Госномер: ${vehicle.plate}`,
      '',
      'Фотографии:',
      stepLines,
    ].join('\n');

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `act-osmotra-${vehicle.plate.replace(/\s+/g, '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
