import { Component, input } from '@angular/core';
import { UserProfile } from '../core/models';

@Component({
  selector: 'app-ranking-row',
  template: `
    <div class="rank-row" role="listitem" [class.current-player]="current()">
      <span class="rank-number">{{ rank() }}</span>
      <span class="min-w-0 flex-1"><strong class="block truncate">{{ player().visible_name }}</strong><small class="text-emerald-700 dark:text-emerald-300">@{{ player().username }}</small></span>
      <strong>{{ player().mmr }}</strong>
    </div>
  `,
})
export class RankingRowComponent {
  readonly player = input.required<UserProfile>();
  readonly rank = input.required<number>();
  readonly current = input(false);
}
