import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SubmissionPhase } from '../../../core/models/upload.model';

interface ProgressCopy {
  readonly title: string;
  readonly subtitle: string;
}

const PROGRESS_COPY: Readonly<Record<'uploading' | 'assessing' | 'finalizing', ProgressCopy>> = {
  uploading: {
    title: 'Отправляем фото на проверку',
    subtitle: 'Не закрывайте страницу, пожалуйста',
  },
  assessing: {
    title: 'Оцениваем состояние автомобиля',
    subtitle: 'Это займёт всего пару минут',
  },
  finalizing: {
    title: 'Формируем результат',
    subtitle: 'Ещё немного и всё подготовим',
  },
};

@Component({
  selector: 'app-upload-progress-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload-progress-page.component.html',
  styleUrl: './upload-progress-page.component.scss',
})
export class UploadProgressPageComponent {
  readonly phase = input.required<SubmissionPhase>();
  readonly progress = input.required<number>();

  readonly copy = computed<ProgressCopy>(() => {
    const phase = this.phase();
    return phase === 'uploading' || phase === 'assessing' || phase === 'finalizing'
      ? PROGRESS_COPY[phase]
      : PROGRESS_COPY.uploading;
  });
}
