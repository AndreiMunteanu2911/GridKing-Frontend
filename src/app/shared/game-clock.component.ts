import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-game-clock',
  template: `<div class="game-clock" [class.game-clock-active]="active()" [class.game-clock-low]="milliseconds() <= 60_000"><small>{{ label() }}</small><strong>{{ display() }}</strong></div>`,
})
export class GameClockComponent {
  readonly milliseconds = input.required<number>();
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly display = computed(() => {
    const totalSeconds = Math.ceil(Math.max(0, this.milliseconds()) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`;
  });
}
