import { Component, OnDestroy, computed } from '@angular/core';
import { MatchService } from '../core/match.service';
import { Move, QueueMode } from '../core/models';
import { AppShellComponent } from '../shared/app-shell.component';
import { BoardComponent } from '../shared/board.component';
import { ButtonComponent } from '../shared/button.component';
import { ChoiceCardComponent } from '../shared/choice-card.component';
import { PanelComponent } from '../shared/panel.component';
import { PlayerStripComponent } from '../shared/player-strip.component';
import { SectionHeadingComponent } from '../shared/section-heading.component';
import { ErrorMessageComponent } from '../shared/error-message.component';

@Component({
  selector: 'app-online-page',
  imports: [AppShellComponent, BoardComponent, ButtonComponent, ChoiceCardComponent, PanelComponent, PlayerStripComponent, SectionHeadingComponent, ErrorMessageComponent],
  template: `
    <app-shell title="Play Online" subtitle="Find an opponent and climb the rankings">
      @if (match.status() === 'idle') {
        <div class="setup-layout setup-layout-narrow">
          <app-section-heading eyebrow="Choose your arena" title="Find your next rival" [centered]="true" />
          <div class="choice-grid">
            <app-choice-card icon="&#9673;" title="Casual" description="Relaxed matches with no rating changes" (chosen)="queue('casual')" />
            <app-choice-card icon="&#9819;" title="Ranked" description="Compete for your leaderboard position" [selected]="true" (chosen)="queue('ranked')" />
          </div>
        </div>
      } @else if (match.status() === 'connecting' || match.status() === 'queued') {
        <app-panel class="queue-state">
          <div class="queue-spinner"></div>
          <h2>Searching...</h2>
          <p>Finding a worthy opponent</p>
          <app-button variant="secondary" (pressed)="match.close()">Cancel</app-button>
        </app-panel>
      } @else if (match.state(); as state) {
        <div class="game-layout">
          <div class="game-board">
            <app-player-strip class="mb-3" [avatar]="(match.opponent()?.visible_name || 'O').charAt(0)" label="Opponent" [name]="match.opponent()?.visible_name || 'Opponent'" [rating]="match.opponent()?.mmr || 1200" />
            <app-board [state]="state" [legalMoves]="match.legalMoves()" [playerColor]="match.color() || 1" [disabled]="!isMyTurn() || match.status() === 'finished'" (move)="play($event)" />
          </div>
          <app-panel class="game-panel" [compact]="true">
            <div class="game-panel-copy">
              <p class="eyebrow">Match status</p>
              <h2 class="font-black text-emerald-950 dark:text-white">{{ statusText() }}</h2>
              <p class="font-semibold text-emerald-800/70 dark:text-emerald-100/70">{{ state.reason ? reasonText(state.reason) : 'Select a piece, then a highlighted square. Captures are mandatory.' }}</p>
            </div>
            <app-error-message [message]="match.error()" />
            @if (match.status() === 'finished') { <app-button (pressed)="match.close()">Find another match</app-button> }
            @else { <app-button variant="danger" (pressed)="match.resign()">Resign match</app-button> }
          </app-panel>
        </div>
      }
    </app-shell>
  `,
})
export class OnlinePage implements OnDestroy {
  readonly isMyTurn = computed(() => this.match.state()?.turn === this.match.color());
  readonly statusText = computed(() => {
    const state = this.match.state();
    if (state?.winner) return state.winner === this.match.color() ? 'You win!' : 'Opponent wins';
    return this.isMyTurn() ? 'Your move' : 'Opponent thinking';
  });

  constructor(readonly match: MatchService) {}
  queue(mode: QueueMode): void { this.match.connect(mode).catch((error) => this.match.error.set(error instanceof Error ? error.message : 'Connection failed.')); }
  play(move: Move): void { this.match.move(move); }
  reasonText(reason: string): string { return reason.replaceAll('_', ' '); }
  ngOnDestroy(): void { this.match.close(); }
}
