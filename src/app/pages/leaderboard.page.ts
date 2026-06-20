import { Component, OnInit, signal } from '@angular/core';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { AuthService } from '../core/auth.service';
import { firestore } from '../core/firebase';
import { UserProfile } from '../core/models';
import { PageHeaderComponent } from '../shared/page-header.component';

@Component({
  selector: 'app-leaderboard-page',
  imports: [PageHeaderComponent],
  template: `
    <main class="min-h-dvh pb-10"><app-page-header title="Leaderboard" />
      <section class="mx-auto grid max-w-5xl gap-6 px-5 lg:grid-cols-[18rem_1fr]">
        <aside class="game-card text-center">
          <div class="mx-auto grid h-20 w-20 place-items-center rounded-full bg-yellow-300 text-4xl text-emerald-950 shadow-[5px_5px_0_#064e3b]">♛</div>
          <h2 class="mt-5 text-2xl font-black text-emerald-950 dark:text-white">{{ auth.profile()?.visible_name }}</h2>
          <p class="font-bold text-emerald-700 dark:text-emerald-300">@{{ auth.profile()?.username }}</p>
          <div class="mt-6 grid grid-cols-3 gap-2">
            <div class="stat"><strong>{{ auth.profile()?.mmr }}</strong><small>MMR</small></div>
            <div class="stat"><strong>{{ auth.profile()?.wins }}</strong><small>Wins</small></div>
            <div class="stat"><strong>{{ auth.profile()?.matches_played }}</strong><small>Games</small></div>
          </div>
        </aside>
        <div class="game-card">
          <div class="mb-5 flex items-end justify-between"><span><p class="eyebrow">Global ranking</p><h2 class="text-2xl font-black text-emerald-950 dark:text-white">Top players</h2></span><span class="text-2xl">🏆</span></div>
          @if (loading()) { <p class="py-10 text-center font-bold">Loading rankings…</p> }
          @for (player of players(); track player.uid; let rank = $index) {
            <div class="rank-row" [class.current-player]="player.uid === auth.user()?.uid"><span class="rank-number">{{ rank + 1 }}</span><span class="min-w-0 flex-1"><strong class="block truncate">{{ player.visible_name }}</strong><small class="text-emerald-700 dark:text-emerald-300">@{{ player.username }}</small></span><strong>{{ player.mmr }}</strong></div>
          }
          @if (error()) { <p class="rounded-xl bg-red-100 p-3 font-bold text-red-800">{{ error() }}</p> }
        </div>
      </section>
    </main>
  `,
})
export class LeaderboardPage implements OnInit {
  readonly players = signal<UserProfile[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor(readonly auth: AuthService) {}
  async ngOnInit(): Promise<void> {
    try {
      const snapshot = await getDocs(query(collection(firestore, 'users'), orderBy('mmr', 'desc'), limit(50)));
      this.players.set(snapshot.docs.map((doc) => doc.data() as UserProfile));
    } catch {
      this.error.set('Could not load the leaderboard. Check Firestore read rules.');
    } finally { this.loading.set(false); }
  }
}
