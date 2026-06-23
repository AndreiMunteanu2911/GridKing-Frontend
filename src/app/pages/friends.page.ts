import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../shared/app-shell.component';
import { ButtonComponent } from '../shared/button.component';
import { ErrorMessageComponent } from '../shared/error-message.component';
import { PanelComponent } from '../shared/panel.component';
import { SocialService } from '../core/social.service';
import { MatchService } from '../core/match.service';

@Component({
  selector: 'app-friends-page',
  imports: [FormsModule, AppShellComponent, ButtonComponent, ErrorMessageComponent, PanelComponent],
  template: `
    <app-shell title="Friends" subtitle="Play directly with people you know">
      <div class="friends-layout">
        <section>
          <app-panel>
            <div class="panel-heading"><span><p class="eyebrow">Your network</p><h2>Friends</h2></span><small>{{ social.friends().length }}</small></div>
            @if (!social.friends().length && !social.loading()) { <p class="empty-state">Search by username to add your first friend.</p> }
            <div class="friend-list">
              @for (friend of social.friends(); track friend.profile.uid) {
                <article class="friend-row">
                  <span class="profile-avatar">{{ friend.profile.visible_name.charAt(0).toUpperCase() }}</span>
                  <span class="friend-copy"><strong>{{ friend.profile.visible_name }}</strong><small>@{{ friend.profile.username }} · {{ friend.in_game ? 'In a game' : friend.online ? 'Online' : 'Offline' }}</small></span>
                  <span class="presence-dot" [class.online]="friend.online" [class.in-game]="friend.in_game"></span>
                  <div class="friend-actions">
                    <app-button [disabled]="!friend.online || friend.in_game" (pressed)="invite(friend.profile.uid, false)">Casual</app-button>
                    <app-button variant="secondary" [disabled]="!friend.online || friend.in_game" (pressed)="invite(friend.profile.uid, true)">Ranked</app-button>
                    <button type="button" class="icon-action" aria-label="Remove friend" (click)="remove(friend.profile.uid)">×</button>
                  </div>
                </article>
              }
            </div>
          </app-panel>
          @if (matches.inviteStatus()) { <p class="settings-note">{{ matches.inviteStatus() }}</p> }
        </section>

        <aside class="friends-sidebar">
          <app-panel>
            <p class="eyebrow">Find players</p><h2 class="panel-title">Search usernames</h2>
            <form class="friend-search" (ngSubmit)="search()"><input class="field-input" name="query" [(ngModel)]="query" placeholder="Username" minlength="2"><app-button type="submit">Search</app-button></form>
            <div class="search-results">
              @for (player of social.results(); track player.uid) {
                <div><span><strong>{{ player.visible_name }}</strong><small>@{{ player.username }}</small></span><app-button variant="secondary" (pressed)="request(player.uid)">Add</app-button></div>
              }
            </div>
          </app-panel>
          @if (social.requests().length) {
            <app-panel>
              <p class="eyebrow">Requests</p><h2 class="panel-title">Pending requests</h2>
              @for (request of social.requests(); track request.from.uid) {
                <div class="request-row"><span><strong>{{ request.from.visible_name }}</strong><small>@{{ request.from.username }}</small></span><span><app-button (pressed)="respond(request.from.uid, true)">Accept</app-button><app-button variant="ghost" (pressed)="respond(request.from.uid, false)">Decline</app-button></span></div>
              }
            </app-panel>
          }
        </aside>
      </div>
      <app-error-message [message]="error() || social.error() || matches.error()" />
    </app-shell>
  `,
})
export class FriendsPage implements OnInit, OnDestroy {
  query = '';
  readonly error = signal('');
  private refreshTimer?: number;
  constructor(readonly social: SocialService, readonly matches: MatchService) {}
  ngOnInit(): void { void this.social.refresh(); this.refreshTimer = window.setInterval(() => void this.social.refresh(), 15_000); }
  ngOnDestroy(): void { window.clearInterval(this.refreshTimer); }
  async search(): Promise<void> { await this.run(() => this.social.search(this.query)); }
  async request(uid: string): Promise<void> { await this.run(() => this.social.request(uid)); }
  async respond(uid: string, accept: boolean): Promise<void> { await this.run(() => this.social.respond(uid, accept)); }
  async remove(uid: string): Promise<void> { await this.run(() => this.social.remove(uid)); }
  invite(uid: string, ranked: boolean): void { this.matches.inviteFriend(uid, ranked); }
  private async run(action: () => Promise<void>): Promise<void> { this.error.set(''); try { await action(); } catch (error) { this.error.set(error instanceof Error ? error.message : 'The request failed.'); } }
}
