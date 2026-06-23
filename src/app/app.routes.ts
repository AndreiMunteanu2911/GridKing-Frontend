import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'auth', canActivate: [guestGuard], loadComponent: () => import('./pages/auth.page').then((m) => m.AuthPage) },
  { path: 'menu', canActivate: [authGuard], loadComponent: () => import('./pages/menu.page').then((m) => m.MenuPage) },
  { path: 'online', canActivate: [authGuard], loadComponent: () => import('./pages/online.page').then((m) => m.OnlinePage) },
  { path: 'bot', canActivate: [authGuard], loadComponent: () => import('./pages/bot.page').then((m) => m.BotPage) },
  { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./pages/settings.page').then((m) => m.SettingsPage) },
  { path: 'leaderboard', canActivate: [authGuard], loadComponent: () => import('./pages/leaderboard.page').then((m) => m.LeaderboardPage) },
  { path: 'friends', canActivate: [authGuard], loadComponent: () => import('./pages/friends.page').then((m) => m.FriendsPage) },
  { path: 'puzzles', canActivate: [authGuard], loadComponent: () => import('./pages/puzzles.page').then((m) => m.PuzzlesPage) },
  { path: 'history', canActivate: [authGuard], loadComponent: () => import('./pages/history.page').then((m) => m.HistoryPage) },
  { path: '', pathMatch: 'full', redirectTo: 'menu' },
  { path: '**', redirectTo: 'menu' },
];
