import { Component, computed, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { BotPersonality, Color, Difficulty, GamePayload, GameState, MatchMove, Move } from '../core/models';
import { Router } from '@angular/router';
import { SoundService } from '../core/sound.service';
import { AppShellComponent } from '../shared/app-shell.component';
import { BoardComponent } from '../shared/board.component';
import { ButtonComponent } from '../shared/button.component';
import { ChoiceCardComponent } from '../shared/choice-card.component';
import { PanelComponent } from '../shared/panel.component';
import { PlayerStripComponent } from '../shared/player-strip.component';
import { SectionHeadingComponent } from '../shared/section-heading.component';
import { ErrorMessageComponent } from '../shared/error-message.component';
import { MoveHistoryComponent } from '../shared/move-history.component';

@Component({
  selector: 'app-bot-page',
  imports: [BoardComponent, AppShellComponent, ButtonComponent, ChoiceCardComponent, PanelComponent, PlayerStripComponent, SectionHeadingComponent, ErrorMessageComponent, MoveHistoryComponent],
  template: `
    <app-shell title="Play Against Bots" subtitle="Practice tactics at your own pace">
      @if (!state()) {
        <div class="setup-layout">
          <app-section-heading eyebrow="Training ground" title="Select difficulty" [centered]="true" />
          <div class="choice-grid choice-grid-three">
            @for (level of levels; track level.value) {
              <app-choice-card [icon]="level.icon" [title]="level.label" [description]="level.detail" [selected]="difficulty() === level.value" (chosen)="difficulty.set(level.value)" />
            }
          </div>
          <p class="play-as-label">Play style</p>
          <div class="segmented-control personality-selector">
            @for (style of personalities; track style.value) {
              <app-button variant="tab" [active]="personality() === style.value" [ariaLabel]="style.description" (pressed)="personality.set(style.value)">{{ style.label }}</app-button>
            }
          </div>
          <p class="selector-help">{{ personalityDescription() }}</p>
          <p class="play-as-label">Play as</p>
          <div class="segmented-control color-selector">
            <app-button variant="tab" [active]="color() === 1" (pressed)="color.set(1)">Red &middot; First</app-button>
            <app-button variant="tab" [active]="color() === 2" (pressed)="color.set(2)">Black</app-button>
          </div>
          <app-button [loading]="busy()" (pressed)="start()">Start game</app-button>
        </div>
      } @else if (state(); as current) {
        <div class="game-layout">
          <div class="game-board">
            <app-player-strip class="mb-3" avatar="AI" [label]="difficulty() + ' · ' + personality()" name="GridKing Bot" />
            <app-board [state]="current" [legalMoves]="legalMoves()" [playerColor]="color()" [disabled]="busy() || current.turn !== color() || !!current.winner" (move)="play($event)" />
          </div>
          <app-panel class="game-panel" [compact]="true">
            <div class="game-panel-copy">
              <p class="eyebrow">Game status</p>
              <h2 class="font-black text-emerald-950 dark:text-white">{{ gameStatus() }}</h2>
              <p class="font-semibold text-emerald-800/70 dark:text-emerald-100/70">Captures are mandatory. Select a piece, then a highlighted square.</p>
            </div>
            <app-error-message [message]="error()" />
            <div class="game-actions">
              @if (current.winner) { <app-button (pressed)="viewAnalysis()">Replay & analysis</app-button> }
              <app-button variant="secondary" (pressed)="reset()">New game</app-button>
            </div>
          </app-panel>
          <app-move-history [history]="history()" />
        </div>
      }
    </app-shell>
  `,
})
export class BotPage {
  readonly difficulty = signal<Difficulty>('medium');
  readonly personality = signal<BotPersonality>('balanced');
  readonly color = signal<Color>(1);
  readonly state = signal<GameState | null>(null);
  readonly legalMoves = signal<Move[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly history = signal<MatchMove[]>([]);
  readonly matchId = signal('');
  readonly gameStatus = computed(() => {
    const state = this.state();
    if (state?.winner) return state.winner === this.color() ? 'You beat the bot!' : 'The bot wins';
    return this.busy() ? 'Bot is thinking...' : 'Your move';
  });
  readonly personalityDescription = computed(() => this.personalities.find((style) => style.value === this.personality())?.description || '');
  readonly levels = [
    { value: 'easy' as Difficulty, label: 'Easy', icon: '&#9679;', detail: 'Depth 2 · piece count' },
    { value: 'medium' as Difficulty, label: 'Medium', icon: '&#9670;', detail: 'Depth 4 · safe edges' },
    { value: 'hard' as Difficulty, label: 'Hard', icon: '&#9819;', detail: 'Depth 6 · promotion strategy' },
  ];
  readonly personalities = [
    { value: 'balanced' as BotPersonality, label: 'Balanced', description: 'A flexible all-round style' },
    { value: 'aggressive' as BotPersonality, label: 'Aggressive', description: 'Pushes forward and values activity' },
    { value: 'defensive' as BotPersonality, label: 'Defensive', description: 'Protects pieces and safe edges' },
    { value: 'trickster' as BotPersonality, label: 'Trickster', description: 'Creates mobility and tactical pressure' },
  ];

  constructor(private readonly api: ApiService, private readonly sounds: SoundService, private readonly router: Router) {}
  async start(): Promise<void> {
    await this.run(() => this.api.post<GamePayload>('/api/bot/start', { difficulty: this.difficulty(), personality: this.personality(), color: this.color() === 1 ? 'red' : 'black' }));
  }
  async play(move: Move): Promise<void> {
    await this.run(() => this.api.post<GamePayload>('/api/bot/move', { move }));
  }
  reset(): void { this.state.set(null); this.legalMoves.set([]); this.history.set([]); this.matchId.set(''); this.error.set(''); }
  viewAnalysis(): void { window.setTimeout(() => void this.router.navigate(['/history'], { queryParams: { match: this.matchId() } }), 700); }
  private async run(request: () => Promise<GamePayload>): Promise<void> {
    this.busy.set(true); this.error.set('');
    try {
      const payload = await request();
      this.state.set(payload.state); this.legalMoves.set(payload.legal_moves); this.history.set(payload.history || []); this.matchId.set(payload.match_id || '');
      if (payload.state.winner) payload.state.winner === this.color() ? this.sounds.win() : this.sounds.lose();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The bot game failed.');
    } finally { this.busy.set(false); }
  }
}
