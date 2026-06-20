import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ButtonComponent } from '../shared/button.component';
import { PanelComponent } from '../shared/panel.component';
import { ErrorMessageComponent } from '../shared/error-message.component';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule, ButtonComponent, PanelComponent, ErrorMessageComponent],
  template: `
    <main class="auth-layout">
      <section class="auth-hero">
        <div class="brand auth-brand"><span class="brand-mark">K</span><span>GridKing</span></div>
        <div>
          <p class="eyebrow text-yellow-300">Online checkers</p>
          <h1>Think ahead.<br><span>Own the board.</span></h1>
          <p>Fast matches, sharp tactics, and a global leaderboard. One crown at a time.</p>
        </div>
        <div class="auth-board" aria-hidden="true">
          @for (square of previewSquares; track $index) { <span [class.preview-dark]="square"><i></i></span> }
        </div>
      </section>
      <section class="auth-form-side">
        <app-panel class="auth-card"><form (ngSubmit)="submit()">
          <p class="eyebrow">Welcome</p>
          <h2>{{ mode() === 'login' ? 'Log in to play' : 'Create your player' }}</h2>
          <div class="my-6 flex rounded-xl bg-emerald-100 p-1 dark:bg-emerald-950">
            <app-button variant="tab" [active]="mode() === 'login'" (pressed)="mode.set('login')">Log in</app-button>
            <app-button variant="tab" [active]="mode() === 'register'" (pressed)="mode.set('register')">Create account</app-button>
          </div>
          @if (mode() === 'register') {
            <label class="field-label">Username<input class="field-input" name="username" [(ngModel)]="username" minlength="3" maxlength="20" pattern="[a-z0-9_]+" autocomplete="username" required></label>
            <label class="field-label">Visible name<input class="field-input" name="visibleName" [(ngModel)]="visibleName" minlength="2" maxlength="30" required></label>
          }
          <label class="field-label">Email<input class="field-input" type="email" name="email" [(ngModel)]="email" autocomplete="email" required></label>
          <label class="field-label">Password<input class="field-input" type="password" name="password" [(ngModel)]="password" minlength="6" [autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'" required></label>
          <app-error-message class="mb-4" [message]="error()" />
          <app-button type="submit" [loading]="busy()" [fullWidth]="true">{{ mode() === 'login' ? 'Play now' : 'Create my player' }}</app-button>
        </form></app-panel>
      </section>
    </main>
  `,
})
export class AuthPage {
  readonly mode = signal<'login' | 'register'>('login');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly previewSquares = Array.from({ length: 32 }, (_, index) => (Math.floor(index / 4) + index) % 2 === 0);
  email = '';
  password = '';
  username = '';
  visibleName = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  async submit(): Promise<void> {
    this.busy.set(true); this.error.set('');
    try {
      if (this.mode() === 'login') await this.auth.login(this.email, this.password);
      else await this.auth.register(this.email, this.password, this.username, this.visibleName);
      await this.router.navigateByUrl('/menu');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Authentication failed.');
    } finally { this.busy.set(false); }
  }
}
