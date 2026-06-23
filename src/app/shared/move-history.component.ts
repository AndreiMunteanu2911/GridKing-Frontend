import { Component, input, output } from '@angular/core';
import { MatchMove } from '../core/models';

@Component({
  selector: 'app-move-history',
  template: `
    <section class="move-history">
      <header><strong>Moves</strong><small>{{ history().length }} played · {{ captureCount() }} captured</small></header>
      @if (!history().length) { <p class="move-history-empty">Moves will appear here.</p> }
      <div class="move-list">
        @for (entry of history(); track entry.ply) {
          <button type="button" [class.move-selected]="selectedPly() === entry.ply" (click)="selected.emit(entry.ply)">
            <span>{{ entry.ply }}.</span>
            <strong>{{ square(entry.move.path[0]) }}–{{ square(entry.move.path[entry.move.path.length - 1]) }}</strong>
            @if (entry.captured_pieces.length) {
              <small class="captured-pieces" title="Captured pieces">
                @for (piece of entry.captured_pieces; track $index) { <i [class.captured-red]="piece === 1 || piece === 3" [class.captured-black]="piece === 2 || piece === 4"></i> }
              </small>
            }
          </button>
        }
      </div>
    </section>
  `,
})
export class MoveHistoryComponent {
  readonly history = input<MatchMove[]>([]);
  readonly selectedPly = input(0);
  readonly selected = output<number>();
  captureCount(): number { return this.history().reduce((total, move) => total + move.captured_pieces.length, 0); }
  square(index: number): string { return `${String.fromCharCode(97 + index % 8)}${8 - Math.floor(index / 8)}`; }
}
