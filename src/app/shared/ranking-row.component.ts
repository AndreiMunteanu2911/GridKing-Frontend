import { Component, input } from '@angular/core';
import { UserProfile } from '../core/models';

@Component({
  selector: 'app-ranking-row',
  template: `
    <div class="rank-row" role="listitem" [class.current-player]="current()">
      <span class="rank-number">{{ rank() }}</span>
      <span class="rank-player"><strong>{{ player().visible_name }}</strong><small>@{{ player().username }}</small></span>
      <strong class="rank-rating">{{ player().mmr }}</strong>
    </div>
  `,
})
export class RankingRowComponent {
  readonly player = input.required<UserProfile>();
  readonly rank = input.required<number>();
  readonly current = input(false);
}
