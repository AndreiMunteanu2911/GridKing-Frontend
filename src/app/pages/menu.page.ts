import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-menu-page',
  imports: [RouterLink],
  template: `
    <main class="min-h-dvh px-5 py-8">
      <div class="mx-auto max-w-5xl">
        <header class="mb-10 flex items-center justify-between">
          <a routerLink="/menu" class="flex items-center gap-3 font-display text-2xl font-black uppercase text-emerald-950 dark:text-yellow-300"><span class="grid h-11 w-11 rotate-3 place-items-center rounded-xl bg-yellow-300 text-2xl text-emerald-950 shadow-[4px_4px_0_#064e3b]">♛</span> GridKing</a>
          <button class="soft-button" (click)="logout()">Log out</button>
        </header>
        <section class="mb-8">
          <p class="font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Welcome back</p>
          <h1 class="font-display text-4xl font-black text-emerald-950 dark:text-white sm:text-5xl">{{ auth.profile()?.visible_name || 'Player' }}</h1>
          <div class="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 font-black text-emerald-950"><span>◆</span> {{ auth.profile()?.mmr || 1200 }} MMR</div>
        </section>
        <section class="grid gap-5 md:grid-cols-2">
          <a routerLink="/online" class="menu-tile bg-emerald-700 text-white"><span class="tile-icon">⚡</span><span><strong>Play Online</strong><small>Casual or ranked matchmaking</small></span><b>→</b></a>
          <a routerLink="/bot" class="menu-tile bg-yellow-300 text-emerald-950"><span class="tile-icon">♟</span><span><strong>Play Bot</strong><small>Three levels of tactical AI</small></span><b>→</b></a>
          <a routerLink="/leaderboard" class="menu-tile bg-lime-200 text-emerald-950"><span class="tile-icon">♛</span><span><strong>Profile & Ranks</strong><small>Stats and global leaderboard</small></span><b>→</b></a>
          <a routerLink="/settings" class="menu-tile bg-emerald-950 text-white"><span class="tile-icon">⚙</span><span><strong>Settings</strong><small>Theme and sound preferences</small></span><b>→</b></a>
        </section>
      </div>
    </main>
  `,
})
export class MenuPage {
  constructor(readonly auth: AuthService, private readonly router: Router) {}
  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/auth');
  }
}
