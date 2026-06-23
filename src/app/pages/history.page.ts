import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { GameState, MatchRecord } from '../core/models';
import { AppShellComponent } from '../shared/app-shell.component';
import { BoardComponent } from '../shared/board.component';
import { ButtonComponent } from '../shared/button.component';
import { ErrorMessageComponent } from '../shared/error-message.component';
import { MoveHistoryComponent } from '../shared/move-history.component';
import { PanelComponent } from '../shared/panel.component';

@Component({
  selector: 'app-history-page',
  imports: [AppShellComponent, BoardComponent, ButtonComponent, ErrorMessageComponent, MoveHistoryComponent, PanelComponent],
  template: `
    <app-shell title="Game History" subtitle="Replay completed games and review every decision">
      @if (selected(); as game) {
        <div class="replay-layout">
          <section class="replay-board">
            <app-board [state]="replayState()" [playerColor]="perspective()" [disabled]="true" />
            <div class="replay-controls">
              <app-button variant="secondary" (pressed)="selectPly(0)">|&larr;</app-button>
              <app-button variant="secondary" (pressed)="selectPly(Math.max(0, selectedPly() - 1))">&larr;</app-button>
              <strong>{{ selectedPly() }} / {{ game.moves.length }}</strong>
              <app-button variant="secondary" (pressed)="selectPly(Math.min(game.moves.length, selectedPly() + 1))">&rarr;</app-button>
              <app-button variant="secondary" (pressed)="selectPly(game.moves.length)">&rarr;|</app-button>
            </div>
          </section>
          <aside class="replay-sidebar">
            <app-panel>
              <p class="eyebrow">{{ game.mode === 'bot' ? 'Bot game' : game.ranked ? 'Ranked PvP' : 'Casual PvP' }}</p>
              <h2 class="panel-title">{{ resultLabel(game) }}</h2>
              <p class="replay-meta">{{ game.moves.length }} moves · {{ game.reason.replaceAll('_', ' ') }}</p>
              @if (analysisForPly(); as analysis) {
                <div class="analysis-card" [attr.data-classification]="analysis.classification">
                  <strong>{{ analysis.classification }}</strong>
                  <span>Best: {{ path(analysis.best_move.path) }}</span>
                  <small>Evaluation loss: {{ analysis.score_loss }}</small>
                </div>
              } @else if (game.analysis_status === 'processing') { <p class="settings-note">Deep analysis is still processing.</p> }
            </app-panel>
            <app-move-history [history]="game.moves" [selectedPly]="selectedPly()" (selected)="selectPly($event)" />
            <app-button variant="ghost" (pressed)="selected.set(null)">Back to all games</app-button>
          </aside>
        </div>
      } @else {
        <div class="history-list">
          @for (game of games(); track game.id) {
            <button type="button" class="history-row" (click)="open(game)">
              <span class="history-result" [class.win]="game.winner_uid === auth.user()?.uid">{{ game.winner_uid === auth.user()?.uid ? 'W' : 'L' }}</span>
              <span><strong>{{ opponentLabel(game) }}</strong><small>{{ game.mode === 'bot' ? (game.bot_personality || 'balanced') + ' bot' : game.ranked ? 'Ranked PvP' : 'Casual PvP' }} · {{ date(game.ended_at) }} · {{ game.moves.length }} moves</small></span>
              <b>&rarr;</b>
            </button>
          }
          @if (!games().length && !loading()) { <p class="empty-state">Completed games will appear here.</p> }
        </div>
      }
      @if (loading()) { <p class="loading-state">Loading game history...</p> }
      <app-error-message [message]="error()" />
    </app-shell>
  `,
})
export class HistoryPage implements OnInit {
  readonly Math = Math;
  readonly games = signal<MatchRecord[]>([]);
  readonly selected = signal<MatchRecord | null>(null);
  readonly selectedPly = signal(0);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly replayState = computed<GameState>(() => { const game = this.selected(); const ply = this.selectedPly(); return !game ? { board: Array(64).fill(0), turn: 1 } : ply === 0 ? game.initial_state : game.moves[ply - 1].state; });
  readonly perspective = computed(() => this.selected()?.black_uid === this.auth.user()?.uid ? 2 : 1);
  readonly analysisForPly = computed(() => this.selected()?.analysis?.find((item) => item.ply === this.selectedPly()) || null);
  constructor(private readonly api: ApiService, readonly auth: AuthService, private readonly route: ActivatedRoute) {}
  async ngOnInit(): Promise<void> {
    try {
      const games = await this.api.get<MatchRecord[]>('/api/matches?limit=50'); this.games.set(games);
      const requested = this.route.snapshot.queryParamMap.get('match'); if (requested) { const found = games.find((game) => game.id === requested); if (found) this.open(found); else this.open(await this.loadRequested(requested)); }
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Could not load game history.'); }
    finally { this.loading.set(false); }
  }
  open(game: MatchRecord): void { this.selected.set(game); this.selectedPly.set(game.moves.length); if (game.analysis_status === 'processing') this.pollAnalysis(game.id, 0); }
  selectPly(ply: number): void { this.selectedPly.set(ply); }
  path(path: number[]): string { return path.map((square) => `${String.fromCharCode(97 + square % 8)}${8 - Math.floor(square / 8)}`).join('–'); }
  date(value: string): string { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)); }
  resultLabel(game: MatchRecord): string { return game.winner_uid === this.auth.user()?.uid ? 'You won' : 'You lost'; }
  opponentLabel(game: MatchRecord): string { if (game.mode === 'bot') return 'GridKing Bot'; return game.red_uid === this.auth.user()?.uid ? game.black_name || 'Opponent' : game.red_name || 'Opponent'; }
  private pollAnalysis(id: string, attempt: number): void {
    if (attempt >= 10) return;
    window.setTimeout(async () => {
      try {
        const updated = await this.api.get<MatchRecord>(`/api/matches/${encodeURIComponent(id)}`);
        this.games.update((games) => games.map((game) => game.id === id ? updated : game));
        if (this.selected()?.id === id) this.selected.set(updated);
        if (updated.analysis_status === 'processing') this.pollAnalysis(id, attempt + 1);
      } catch { this.pollAnalysis(id, attempt + 1); }
    }, 2000);
  }
  private async loadRequested(id: string, attempt = 0): Promise<MatchRecord> {
    try { return await this.api.get<MatchRecord>(`/api/matches/${encodeURIComponent(id)}`); }
    catch (error) {
      if (attempt >= 6) throw error;
      await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
      return this.loadRequested(id, attempt + 1);
    }
  }
}
