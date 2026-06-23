import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { SettingsService } from '../core/settings.service';
import { SoundService } from '../core/sound.service';
import { AppShellComponent } from '../shared/app-shell.component';
import { ButtonComponent } from '../shared/button.component';
import { PanelComponent } from '../shared/panel.component';
import { SettingToggleComponent } from '../shared/setting-toggle.component';
import { ApiService } from '../core/api.service';
import { ErrorMessageComponent } from '../shared/error-message.component';
import { MatchService } from '../core/match.service';

@Component({
  selector: 'app-settings-page',
  imports: [AppShellComponent, ButtonComponent, PanelComponent, SettingToggleComponent, ErrorMessageComponent],
  template: `
    <app-shell title="Settings" subtitle="Make GridKing feel right on this device">
      <section class="settings-layout">
        <app-panel><div class="settings-list">
          <app-setting-toggle title="Dark mode" description="Use a deeper nighttime palette" [enabled]="settings.darkMode()" (toggled)="settings.darkMode.update(value => !value)" />
          <app-setting-toggle title="Game sounds" description="Moves, matchmaking, and result effects" [enabled]="!settings.muted()" (toggled)="toggleSound()" />
          <app-setting-toggle title="Show online status" description="Let friends see when you are online or in a game" [enabled]="auth.profile()?.presence_visible !== false" (toggled)="togglePresence()" />
        </div></app-panel>
        <p class="settings-note">Preferences are saved on this device. Enabling sound plays a short preview.</p>
        <app-button variant="danger" (pressed)="logout()">Log out</app-button>
        <app-error-message [message]="error()" />
      </section>
    </app-shell>
  `,
})
export class SettingsPage {
  readonly error = signal('');
  constructor(readonly settings: SettingsService, private readonly sounds: SoundService, readonly auth: AuthService, private readonly router: Router, private readonly api: ApiService, private readonly matches: MatchService) {}

  toggleSound(): void {
    this.settings.muted.update((value) => !value);
    if (!this.settings.muted()) this.sounds.match();
  }

  async togglePresence(): Promise<void> {
    const visible = this.auth.profile()?.presence_visible === false;
    this.error.set('');
    try { await this.api.post<void>('/api/friends/presence', { visible }); await this.auth.refreshProfile(); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Could not save presence preference.'); }
  }

  async logout(): Promise<void> {
    this.matches.disconnect();
    await this.auth.logout();
    await this.router.navigateByUrl('/auth');
  }
}
