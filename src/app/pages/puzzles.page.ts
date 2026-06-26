import { Component, OnInit, computed, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { DailyPuzzle, Move } from '../core/models';
import { AppShellComponent } from '../shared/app-shell.component';
import { BoardComponent } from '../shared/board.component';
import { ErrorMessageComponent } from '../shared/error-message.component';
import { PanelComponent } from '../shared/panel.component';

@Component({
  selector: 'app-puzzles-page',
  imports: [AppShellComponent, BoardComponent, ErrorMessageComponent, PanelComponent],
  template: `
    <app-shell title="Daily Puzzle" subtitle="One fresh tactical position every day">
      @if (puzzle(); as current) {
        <div class="puzzle-layout">
          <app-panel class="puzzle-panel">
            <p class="eyebrow">{{ current.date }} - {{ current.difficulty }}</p>
            <h2>{{ solved() ? 'Puzzle complete' : 'Find the best move' }}</h2>
            <p>{{ solved() ? 'Come back tomorrow for a new position.' : 'Captures are mandatory. You can try as many times as needed.' }}</p>
            <div class="puzzle-streak"><strong>{{ auth.profile()?.puzzle_streak || 0 }}</strong><small>day streak</small></div>
            @if (feedback()) { <p class="puzzle-feedback" [class.correct]="solved()">{{ feedback() }}</p> }
          </app-panel>
          <div class="game-board"><app-board [state]="current.state" [legalMoves]="current.legal_moves" [playerColor]="current.state.turn" [disabled]="solved()" (move)="solve($event)" /></div>
        </div>
      } @else if (loading()) { <p class="loading-state">Preparing today's puzzle...</p> }
      <app-error-message [message]="error()" />
    </app-shell>
  `,
})
export class PuzzlesPage implements OnInit {
  readonly puzzle = signal<DailyPuzzle | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly feedback = signal('');
  readonly solved = computed(() => !!this.puzzle()?.completed);
  constructor(private readonly api: ApiService, readonly auth: AuthService) {}
  async ngOnInit(): Promise<void> { try { this.puzzle.set(await this.api.get<DailyPuzzle>('/api/puzzles/daily')); } catch (error) { this.error.set(error instanceof Error ? error.message : 'Could not load the puzzle.'); } finally { this.loading.set(false); } }
  async solve(move: Move): Promise<void> {
    const puzzle = this.puzzle(); if (!puzzle) return;
    try {
      const result = await this.api.post<{ correct: boolean }>(`/api/puzzles/${encodeURIComponent(puzzle.id)}/complete`, { move });
      if (result.correct) { this.puzzle.set({ ...puzzle, completed: true }); this.feedback.set('Correct - excellent move.'); await this.auth.refreshProfile(); }
      else this.feedback.set('That move is legal, but there is a stronger continuation. Try again.');
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Could not check the move.'); }
  }
}
