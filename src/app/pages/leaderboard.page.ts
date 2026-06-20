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
      <section class="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <app-panel class="text-center">
          <div class="mx-auto grid h-20 w-20 place-items-center rounded-xl bg-yellow-300 text-4xl text-emerald-950 shadow-[inset_0_-4px_0_rgb(120_53_15_/_0.2)]">&#9819;</div>
          <h2 class="mt-5 text-2xl font-black text-emerald-950 dark:text-white">{{ auth.profile()?.visible_name }}</h2>
          <p class="font-bold text-emerald-700 dark:text-emerald-300">@{{ auth.profile()?.username }}</p>
          <div class="mt-6 grid grid-cols-3 gap-2">
            <app-stat-card [value]="auth.profile()?.mmr" label="Rating" />
            <app-stat-card [value]="auth.profile()?.wins" label="Wins" />
            <app-stat-card [value]="auth.profile()?.matches_played" label="Games" />
          </div>
        </app-panel>
        <app-panel>
          <div class="mb-5 flex items-end justify-between"><span><p class="eyebrow">Global ranking</p><h2 class="text-2xl font-black text-emerald-950 dark:text-white">Top players</h2></span><span class="text-2xl">&#9819;</span></div>
          @if (loading()) { <p class="py-10 text-center font-bold">Loading rankings...</p> }
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
