import { Component, OnDestroy, computed, signal } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header.component';
import { BoardComponent } from '../shared/board.component';
import { MatchService } from '../core/match.service';
import { Move, QueueMode } from '../core/models';

@Component({
  selector: 'app-online-page',
  imports: [PageHeaderComponent, BoardComponent],
  template: `
    <main class="min-h-dvh pb-10">
      <app-page-header title="Play Online" />
      <section class="mx-auto max-w-5xl px-5">
        @if (match.status() === 'idle') {
          <div class="mx-auto max-w-xl text-center">
            <p class="eyebrow">Choose your arena</p>
            <h2 class="section-title">Find your next rival</h2>
            <div class="mt-8 grid gap-5 sm:grid-cols-2">
              <button class="game-card mode-card" (click)="queue('casual')"><span class="text-5xl">☘</span><strong>Casual</strong><small>Relaxed matches with no MMR changes</small></button>
              <button class="game-card mode-card border-yellow-400" (click)="queue('ranked')"><span class="text-5xl">♛</span><strong>Ranked</strong><small>Compete for your place on the leaderboard</small></button>
            </div>
          </div>
        } @else if (match.status() === 'connecting' || match.status() === 'queued') {
          <div class="game-card mx-auto max-w-md text-center">
            <div class="mx-auto mb-5 h-16 w-16 animate-spin rounded-full border-8 border-emerald-100 border-t-yellow-400"></div>
            <h2 class="section-title">Searching…</h2>
            <p class="mt-2 font-semibold text-emerald-800/70 dark:text-emerald-100/70">Finding a worthy opponent</p>
            <button class="soft-button mt-6" (click)="match.close()">Cancel</button>
          </div>
        } @else if (match.state(); as state) {
          <div class="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div class="mx-auto w-full max-w-[42rem]">
              <div class="mb-4 flex items-center justify-between rounded-2xl bg-emerald-950 px-4 py-3 text-white">
                <span><small class="block text-xs uppercase tracking-widest text-emerald-300">Opponent</small><strong>{{ match.opponent()?.visible_name || 'Opponent' }}</strong></span>
                <span class="rounded-full bg-yellow-300 px-3 py-1 font-black text-emerald-950">{{ match.opponent()?.mmr }} MMR</span>
              </div>
              <app-board [state]="state" [legalMoves]="match.legalMoves()" [playerColor]="match.color() || 1" [disabled]="!isMyTurn() || match.status() === 'finished'" (move)="play($event)" />
            </div>
            <aside class="game-card">
              <p class="eyebrow">Match status</p>
              <h2 class="mt-2 text-2xl font-black text-emerald-950 dark:text-white">{{ statusText() }}</h2>
              <p class="mt-3 text-sm font-semibold text-emerald-800/70 dark:text-emerald-100/70">{{ state.reason ? reasonText(state.reason) : 'Mandatory captures are highlighted. Complete every jump in the sequence.' }}</p>
              @if (match.error()) { <p class="mt-4 rounded-xl bg-red-100 p-3 text-sm font-bold text-red-800">{{ match.error() }}</p> }
              @if (match.status() === 'finished') {
                <button class="arcade-button mt-6 w-full" (click)="match.close()">Find another match</button>
              } @else {
                <button class="soft-button mt-6 w-full" (click)="match.resign()">Resign match</button>
              }
            </aside>
          </div>
        }
      </section>
    </main>
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
  queue(mode: QueueMode): void {
    this.match.connect(mode).catch((error) => this.match.error.set(error instanceof Error ? error.message : 'Connection failed.'));
  }
  play(move: Move): void { this.match.move(move); }
  reasonText(reason: string): string { return reason.replaceAll('_', ' '); }
  ngOnDestroy(): void { this.match.close(); }
}
