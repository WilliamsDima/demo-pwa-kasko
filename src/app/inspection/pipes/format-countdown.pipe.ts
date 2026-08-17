import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatCountdown' })
export class FormatCountdownPipe implements PipeTransform {
  transform(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
