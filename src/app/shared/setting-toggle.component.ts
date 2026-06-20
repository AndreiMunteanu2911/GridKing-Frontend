import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-setting-toggle',
  template: `
    <button class="setting-row" role="switch" [attr.aria-checked]="enabled()" (click)="toggled.emit()">
      <span><strong>{{ title() }}</strong><small>{{ description() }}</small></span>
      <span class="toggle" [class.toggle-on]="enabled()"><i></i></span>
    </button>
  `,
})
export class SettingToggleComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly enabled = input.required<boolean>();
  readonly toggled = output<void>();
}
