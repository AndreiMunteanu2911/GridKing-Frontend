import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type MenuTileVariant = 'green' | 'yellow' | 'cream' | 'dark';

@Component({
  selector: 'app-menu-tile',
  imports: [RouterLink],
  template: `
    <a [routerLink]="route()" class="menu-tile" [class.menu-tile-green]="variant() === 'green'" [class.menu-tile-yellow]="variant() === 'yellow'" [class.menu-tile-cream]="variant() === 'cream'" [class.menu-tile-dark]="variant() === 'dark'">
      <span class="tile-icon" [innerHTML]="icon()"></span><span class="tile-copy"><strong>{{ title() }}</strong><small>{{ description() }}</small></span><b aria-hidden="true">&rarr;</b>
    </a>
  `,
})
export class MenuTileComponent {
  readonly route = input.required<string>();
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly variant = input<MenuTileVariant>('green');
}
