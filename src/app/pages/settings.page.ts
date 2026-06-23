import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { SettingsService } from '../core/settings.service';
import { SoundService } from '../core/sound.service';
import { AppShellComponent } from '../shared/app-shell.component';
import { ButtonComponent } from '../shared/button.component';
import { PanelComponent } from '../shared/panel.component';
import { SettingToggleComponent } from '../shared/setting-toggle.component';

@Component({
  selector: 'app-settings-page',
  imports: [AppShellComponent, ButtonComponent, PanelComponent, SettingToggleComponent],
  template: `
    <app-shell title="Settings" subtitle="Make GridKing feel right on this device">
      <section class="settings-layout">
        <app-panel><div class="settings-list">
          <app-setting-toggle title="Dark mode" description="Use a deeper nighttime palette" [enabled]="settings.darkMode()" (toggled)="settings.darkMode.update(value => !value)" />
          <app-setting-toggle title="Game sounds" description="Moves, matchmaking, and result effects" [enabled]="!settings.muted()" (toggled)="toggleSound()" />
        </div></app-panel>
        <p class="settings-note">Preferences are saved on this device. Enabling sound plays a short preview.</p>
        <app-button variant="danger" (pressed)="logout()">Log out</app-button>
      </section>
    </app-shell>
  `,
})
export class SettingsPage {
  constructor(readonly settings: SettingsService, private readonly sounds: SoundService, private readonly auth: AuthService, private readonly router: Router) {}

  toggleSound(): void {
    this.settings.muted.update((value) => !value);
    if (!this.settings.muted()) this.sounds.match();
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/auth');
  }
}
