import { Component, computed, input, output, signal } from '@angular/core';
import { Color, GameState, Move } from '../core/models';

@Component({
  selector: 'app-board',
  template: `
    <div class="board-frame" role="grid" aria-label="Checkers board">
      @for (index of squares(); track index) {
        <button
          type="button"
          role="gridcell"
          class="board-square"
          [class.dark-square]="isDark(index)"
          [class.light-square]="!isDark(index)"
          [class.move-target]="nextTargets().includes(index)"
          [class.selected-square]="selectedPath().includes(index)"
          [disabled]="disabled() || !isDark(index)"
          (click)="select(index)"
          [attr.aria-label]="label(index)"
        >
          @if (state().board[index]; as piece) {
            <span class="piece" [class.red-piece]="piece === 1 || piece === 3" [class.black-piece]="piece === 2 || piece === 4">
              @if (piece === 3 || piece === 4) { <span class="crown">♛</span> }
            </span>
          }
        </button>
      }
    </div>
  `,
})
export class BoardComponent {
  readonly state = input.required<GameState>();
  readonly legalMoves = input<Move[]>([]);
  readonly playerColor = input<Color>(1);
  readonly disabled = input(false);
  readonly move = output<Move>();
  readonly selectedPath = signal<number[]>([]);
  readonly squares = computed(() => {
    const values = Array.from({ length: 64 }, (_, index) => index);
    return this.playerColor() === 2 ? values.reverse() : values;
  });
  readonly nextTargets = computed(() => {
    const path = this.selectedPath();
    if (!path.length) return [];
    return this.legalMoves()
      .filter((candidate) => path.every((square, index) => candidate.path[index] === square))
      .map((candidate) => candidate.path[path.length])
      .filter((value): value is number => value !== undefined);
  });

  select(index: number): void {
    const current = this.selectedPath();
    if (!current.length) {
      if (this.legalMoves().some((move) => move.path[0] === index)) this.selectedPath.set([index]);
      return;
    }
    if (!this.nextTargets().includes(index)) {
      this.selectedPath.set(this.legalMoves().some((move) => move.path[0] === index) ? [index] : []);
      return;
    }
    const next = [...current, index];
    const exact = this.legalMoves().find((move) => move.path.length === next.length && move.path.every((square, i) => square === next[i]));
    const longer = this.legalMoves().some((move) => move.path.length > next.length && next.every((square, i) => move.path[i] === square));
    if (exact && !longer) {
      this.selectedPath.set([]);
      this.move.emit(exact);
    } else {
      this.selectedPath.set(next);
    }
  }

  isDark(index: number): boolean {
    return (Math.floor(index / 8) + (index % 8)) % 2 === 1;
  }

  label(index: number): string {
    const piece = this.state().board[index];
    const names = ['empty', 'red piece', 'black piece', 'red king', 'black king'];
    return `Row ${Math.floor(index / 8) + 1}, column ${(index % 8) + 1}, ${names[piece]}`;
  }
}
