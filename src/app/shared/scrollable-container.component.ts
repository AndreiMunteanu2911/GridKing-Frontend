import { Component, input } from '@angular/core';

@Component({
  selector: 'app-scrollable-container',
  template: `<div class="scrollable-container" [style.max-height]="maxHeight()" [attr.role]="role() || null" [attr.aria-label]="ariaLabel() || null"><ng-content /></div>`,
})
export class ScrollableContainerComponent {
  readonly maxHeight = input('32rem');
  readonly role = input('');
  readonly ariaLabel = input('');
}
