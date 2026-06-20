import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule],
  template: `
    <main class="min-h-dvh px-5 py-10">
      <section class="mx-auto grid min-h-[80vh] max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div class="text-center lg:text-left">
          <div class="mb-5 inline-grid h-24 w-24 rotate-3 place-items-center rounded-[2rem] border-4 border-emerald-950 bg-yellow-300 text-5xl shadow-[8px_8px_0_#064e3b]">♛</div>
          <p class="mb-2 font-black uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-300">Own the board</p>
          <h1 class="font-display text-6xl font-black uppercase leading-none text-emerald-950 dark:text-yellow-300 sm:text-7xl">Grid<span class="text-yellow-500">King</span></h1>
          <p class="mx-auto mt-5 max-w-md text-lg font-semibold text-emerald-900/70 dark:text-emerald-100/70 lg:mx-0">Fast matches. Sharp tactics. One crown at a time.</p>
        </div>
        <form class="game-card mx-auto w-full max-w-md" (ngSubmit)="submit()">
          <div class="mb-6 flex rounded-2xl bg-emerald-100 p-1 dark:bg-emerald-950">
            <button type="button" class="tab-button" [class.active-tab]="mode() === 'login'" (click)="mode.set('login')">Log in</button>
            <button type="button" class="tab-button" [class.active-tab]="mode() === 'register'" (click)="mode.set('register')">Create account</button>
          </div>
          @if (mode() === 'register') {
            <label class="field-label">Username<input class="field-input" name="username" [(ngModel)]="username" minlength="3" maxlength="20" pattern="[a-z0-9_]+" required></label>
            <label class="field-label">Visible name<input class="field-input" name="visibleName" [(ngModel)]="visibleName" minlength="2" maxlength="30" required></label>
          }
          <label class="field-label">Email<input class="field-input" type="email" name="email" [(ngModel)]="email" autocomplete="email" required></label>
          <label class="field-label">Password<input class="field-input" type="password" name="password" [(ngModel)]="password" minlength="6" autocomplete="current-password" required></label>
          @if (error()) { <p class="mb-4 rounded-xl bg-red-100 p-3 text-sm font-bold text-red-800">{{ error() }}</p> }
          <button class="arcade-button w-full" type="submit" [disabled]="busy()">{{ busy() ? 'Please wait…' : mode() === 'login' ? 'Enter the arena' : 'Create my player' }}</button>
        </form>
      </section>
    </main>
  `,
})
export class AuthPage {
  readonly mode = signal<'login' | 'register'>('login');
  readonly busy = signal(false);
  readonly error = signal('');
  email = '';
  password = '';
  username = '';
  visibleName = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      if (this.mode() === 'login') await this.auth.login(this.email, this.password);
      else await this.auth.register(this.email, this.password, this.username, this.visibleName);
      await this.router.navigateByUrl('/menu');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      this.busy.set(false);
    }
  }
}
