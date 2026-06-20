import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'tab';

@Component({
  selector: 'app-button',
  template: `
    <button
      [attr.type]="type()"
      class="ui-button"
      [class.ui-button-primary]="variant() === 'primary'"
      [class.ui-button-secondary]="variant() === 'secondary'"
      [class.ui-button-danger]="variant() === 'danger'"
      [class.ui-button-ghost]="variant() === 'ghost'"
      [class.ui-button-tab]="variant() === 'tab'"
      [class.ui-button-full]="fullWidth()"
      [class.ui-button-active]="active()"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-pressed]="variant() === 'tab' ? active() : null"
      (click)="pressed.emit()"
    >
      @if (loading()) { <span class="ui-button-spinner" aria-hidden="true"></span> }
      <ng-content />
    </button>
  `,
  host: { '[class.ui-button-host-full]': 'fullWidth()', '[class.ui-button-host-tab]': 'variant() === "tab"' },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly active = input(false);
  readonly ariaLabel = input('');
  readonly pressed = output<void>();
}
