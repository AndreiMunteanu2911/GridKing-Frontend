import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <aside class="app-sidebar">
        <a routerLink="/menu" class="brand" aria-label="GridKing home">
          <span class="brand-mark">K</span><span>GridKing</span>
        </a>
        <nav class="main-nav" aria-label="Primary navigation">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }">
              <span class="nav-icon" [innerHTML]="item.icon"></span><span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <a routerLink="/leaderboard" class="sidebar-profile">
          <span class="profile-avatar">{{ (auth.profile()?.visible_name || 'P').charAt(0).toUpperCase() }}</span>
          <span><strong>{{ auth.profile()?.visible_name || 'Player' }}</strong><small>{{ auth.profile()?.mmr || 1200 }} rating</small></span>
        </a>
      </aside>

      <div class="app-content">
        <header class="topbar">
          <div class="topbar-title"><p class="eyebrow">GridKing</p><h1>{{ title() }}</h1>@if (subtitle()) { <p class="topbar-subtitle">{{ subtitle() }}</p> }</div>
          <a routerLink="/leaderboard" class="rating-pill"><span>&#9670;</span> {{ auth.profile()?.mmr || 1200 }}</a>
        </header>
        <main class="page-content"><ng-content /></main>
      </div>

      <nav class="mobile-nav" aria-label="Mobile navigation">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }">
            <span [innerHTML]="item.icon"></span><small>{{ item.shortLabel }}</small>
          </a>
        }
      </nav>
    </div>
  `,
})
export class AppShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly navItems = [
    { path: '/menu', label: 'Home', shortLabel: 'Home', icon: '&#8962;' },
    { path: '/online', label: 'Play online', shortLabel: 'Online', icon: '&#9876;' },
    { path: '/bot', label: 'Play bot', shortLabel: 'Bot', icon: '&#9823;' },
    { path: '/leaderboard', label: 'Leaderboard', shortLabel: 'Ranks', icon: '&#9819;' },
    { path: '/settings', label: 'Settings', shortLabel: 'Settings', icon: '&#9881;' },
  ];

  constructor(readonly auth: AuthService) {}
}
