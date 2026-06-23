import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { UserProfile } from '../core/models';
import { AppShellComponent } from '../shared/app-shell.component';
import { PanelComponent } from '../shared/panel.component';
import { ScrollableContainerComponent } from '../shared/scrollable-container.component';
import { ErrorMessageComponent } from '../shared/error-message.component';
import { RankingRowComponent } from '../shared/ranking-row.component';
import { StatCardComponent } from '../shared/stat-card.component';

@Component({
  selector: 'app-leaderboard-page',
  imports: [AppShellComponent, PanelComponent, ScrollableContainerComponent, ErrorMessageComponent, RankingRowComponent, StatCardComponent],
  template: `
    <app-shell title="Leaderboard" subtitle="See how you stack up against the field">
      <section class="leaderboard-layout">
        <app-panel class="profile-card">
          <div class="profile-card-avatar">{{ (auth.profile()?.visible_name || 'P').charAt(0).toUpperCase() }}</div>
          <h2>{{ auth.profile()?.visible_name }}</h2>
          <p>@{{ auth.profile()?.username }}</p>
          <div class="profile-stats">
            <app-stat-card [value]="auth.profile()?.mmr" label="Rating" />
            <app-stat-card [value]="auth.profile()?.wins" label="Wins" />
            <app-stat-card [value]="auth.profile()?.matches_played" label="Games" />
          </div>
        </app-panel>
        <app-panel>
          <div class="leaderboard-header"><span><p class="eyebrow">Global ranking</p><h2>Top players</h2></span><span aria-hidden="true">&#9819;</span></div>
          @if (loading()) { <p class="loading-state">Loading rankings...</p> }
          <app-scrollable-container maxHeight="36rem" role="list" ariaLabel="Global player rankings">
            @for (player of players(); track player.uid; let rank = $index) {
              <app-ranking-row [player]="player" [rank]="rank + 1" [current]="player.uid === auth.user()?.uid" />
            }
          </app-scrollable-container>
          <app-error-message [message]="error()" />
        </app-panel>
      </section>
    </app-shell>
  `,
})
export class LeaderboardPage implements OnInit {
  readonly players = signal<UserProfile[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor(readonly auth: AuthService, private readonly api: ApiService) {}
  async ngOnInit(): Promise<void> {
    try {
      this.players.set(await this.api.get<UserProfile[]>('/api/leaderboard?limit=50'));
    } catch {
      this.error.set('Could not load the leaderboard. Check the backend connection.');
    } finally { this.loading.set(false); }
  }
}
