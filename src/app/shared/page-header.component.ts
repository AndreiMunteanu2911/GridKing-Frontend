import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  template: `
    <header class="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
      <a routerLink="/menu" class="arcade-button grid h-11 w-11 place-items-center p-0" aria-label="Back to menu">←</a>
      <h1 class="font-display text-2xl font-black uppercase tracking-wider text-emerald-950 dark:text-yellow-300">{{ title() }}</h1>
      <div class="h-11 w-11"></div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
}
