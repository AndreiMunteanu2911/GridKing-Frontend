import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-choice-card',
  template: `
    <button class="ui-panel choice-card" [class.choice-card-selected]="selected()" [disabled]="disabled()" [attr.aria-pressed]="selected()" (click)="chosen.emit()">
      <span class="choice-card-icon" [innerHTML]="icon()"></span><strong>{{ title() }}</strong><small>{{ description() }}</small>
    </button>
  `,
})
export class ChoiceCardComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly selected = input(false);
  readonly disabled = input(false);
  readonly chosen = output<void>();
}
