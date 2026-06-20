import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `<div class="stat"><strong>{{ value() ?? '—' }}</strong><small>{{ label() }}</small></div>`,
})
export class StatCardComponent {
  readonly value = input<string | number | null | undefined>();
  readonly label = input.required<string>();
}
