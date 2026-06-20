import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  template: `<header class="content-heading" [class.text-center]="centered()"><p class="eyebrow">{{ eyebrow() }}</p><h2>{{ title() }}</h2>@if (description()) { <p class="section-description">{{ description() }}</p> }</header>`,
})
export class SectionHeadingComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input('');
  readonly centered = input(false);
}
