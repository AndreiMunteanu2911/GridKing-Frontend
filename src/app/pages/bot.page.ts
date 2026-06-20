import { Component, computed, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Color, Difficulty, GamePayload, GameState, Move } from '../core/models';
import { BoardComponent } from '../shared/board.component';
import { PageHeaderComponent } from '../shared/page-header.component';

@Component({
  selector: 'app-bot-page',
  imports: [BoardComponent, PageHeaderComponent],
  template: `
    <main class="min-h-dvh pb-10">
      <app-page-header title="Play Bot" />
      <section class="mx-auto max-w-5xl px-5">
        @if (!state()) {
          <div class="mx-auto max-w-2xl text-center">
            <p class="eyebrow">Training ground</p><h2 class="section-title">Select difficulty</h2>
            <div class="mt-7 grid gap-4 sm:grid-cols-3">
              @for (level of levels; track level.value) {
                <button class="game-card mode-card" [class.border-yellow-400]="difficulty() === level.value" (click)="difficulty.set(level.value)">
                  <span class="text-4xl">{{ level.icon }}</span><strong>{{ level.label }}</strong><small>{{ level.detail }}</small>
                </button>
              }
            </div>
            <p class="mb-3 mt-7 font-black text-emerald-950 dark:text-white">Play as</p>
            <div class="mx-auto mb-7 flex max-w-xs rounded-2xl bg-emerald-100 p-1 dark:bg-emerald-950">
              <button class="tab-button" [class.active-tab]="color() === 1" (click)="color.set(1)">Red · First</button>
              <button class="tab-button" [class.active-tab]="color() === 2" (click)="color.set(2)">Black</button>
            </div>
            <button class="arcade-button px-12" (click)="start()" [disabled]="busy()">Start game</button>
          </div>
        } @else if (state(); as current) {
          <div class="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div class="mx-auto w-full max-w-[42rem]">
              <app-board [state]="current" [legalMoves]="legalMoves()" [playerColor]="color()" [disabled]="busy() || current.turn !== color() || !!current.winner" (move)="play($event)" />
            </div>
            <aside class="game-card">
              <p class="eyebrow">{{ difficulty() }} bot</p>
              <h2 class="mt-2 text-2xl font-black text-emerald-950 dark:text-white">{{ gameStatus() }}</h2>
              <p class="mt-3 text-sm font-semibold text-emerald-800/70 dark:text-emerald-100/70">The AI evaluates every move on the server. Captures are always mandatory.</p>
              @if (error()) { <p class="mt-4 rounded-xl bg-red-100 p-3 text-sm font-bold text-red-800">{{ error() }}</p> }
              <button class="soft-button mt-6 w-full" (click)="reset()">New game</button>
            </aside>
          </div>
        }
      </section>
    </main>
  `,
})
export class BotPage {
  readonly difficulty = signal<Difficulty>('medium');
  readonly color = signal<Color>(1);
  readonly state = signal<GameState | null>(null);
  readonly legalMoves = signal<Move[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly gameStatus = computed(() => {
    const state = this.state();
    if (state?.winner) return state.winner === this.color() ? 'You beat the bot!' : 'The bot wins';
    return this.busy() ? 'Bot is thinking…' : 'Your move';
  });
  readonly levels = [
    { value: 'easy' as Difficulty, label: 'Easy', icon: '●', detail: 'Depth 2 · piece count' },
    { value: 'medium' as Difficulty, label: 'Medium', icon: '◆', detail: 'Depth 4 · safe edges' },
    { value: 'hard' as Difficulty, label: 'Hard', icon: '♛', detail: 'Depth 6 · promotion strategy' },
  ];

  constructor(private readonly api: ApiService) {}
  async start(): Promise<void> {
    await this.run(() => this.api.post<GamePayload>('/api/bot/start', { difficulty: this.difficulty(), color: this.color() === 1 ? 'red' : 'black' }));
  }
  async play(move: Move): Promise<void> {
    await this.run(() => this.api.post<GamePayload>('/api/bot/move', { move }));
  }
  reset(): void { this.state.set(null); this.legalMoves.set([]); this.error.set(''); }
  private async run(request: () => Promise<GamePayload>): Promise<void> {
    this.busy.set(true); this.error.set('');
    try {
      const payload = await request();
      this.state.set(payload.state); this.legalMoves.set(payload.legal_moves);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The bot game failed.');
    } finally { this.busy.set(false); }
  }
}
