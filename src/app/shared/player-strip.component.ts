import { Component, input } from '@angular/core';

@Component({
  selector: 'app-player-strip',
  template: `
    <div class="player-strip">
      <span class="profile-avatar">{{ avatar() }}</span>
      <span class="min-w-0 flex-1"><small>{{ label() }}</small><strong>{{ name() }}</strong></span>
      @if (rating() !== null) { <b>{{ rating() }}</b> }
    </div>
  `,
})
export class PlayerStripComponent {
  readonly avatar = input.required<string>();
  readonly label = input.required<string>();
  readonly name = input.required<string>();
  readonly rating = input<number | null>(null);
}
