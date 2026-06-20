import { Component } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header.component';
import { SettingsService } from '../core/settings.service';

@Component({
  selector: 'app-settings-page',
  imports: [PageHeaderComponent],
  template: `
    <main class="min-h-dvh"><app-page-header title="Settings" />
      <section class="mx-auto max-w-xl px-5">
        <div class="game-card space-y-4">
          <button class="setting-row" (click)="settings.darkMode.update(value => !value)"><span><strong>Dark mode</strong><small>Use a deeper nighttime palette</small></span><span class="toggle" [class.toggle-on]="settings.darkMode()"><i></i></span></button>
          <button class="setting-row" (click)="settings.muted.update(value => !value)"><span><strong>Mute sound</strong><small>Silence moves and match effects</small></span><span class="toggle" [class.toggle-on]="settings.muted()"><i></i></span></button>
        </div>
        <p class="mt-5 text-center text-sm font-semibold text-emerald-800/60 dark:text-emerald-100/60">Preferences are saved on this device.</p>
      </section>
    </main>
  `,
})
export class SettingsPage { constructor(readonly settings: SettingsService) {} }
