import { Component, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  template: `<section class="ui-panel" [class.ui-panel-compact]="compact()"><ng-content /></section>`,
})
export class PanelComponent {
  readonly compact = input(false);
}
