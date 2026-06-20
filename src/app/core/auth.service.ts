import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthUser, SessionPayload, UserProfile } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(null);
  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly authenticated = computed(() => !!this.user());
  readonly ready: Promise<void>;

  constructor(private readonly api: ApiService) {
    this.ready = this.initialize();
  }

  async login(email: string, password: string): Promise<void> {
    const session = await this.api.publicPost<SessionPayload>('/auth/login', { email, password });
    this.api.setSession(session);
    this.user.set(session.user);
    this.profile.set(session.profile || null);
  }

  async register(email: string, password: string, username: string, visibleName: string): Promise<void> {
    const session = await this.api.publicPost<SessionPayload>('/auth/register', { email, password, username, visible_name: visibleName });
    if (!session.id_token) throw new Error('Account created. Sign in to continue.');
    this.api.setSession(session);
    this.user.set(session.user);
    this.profile.set(session.profile || null);
  }

  async logout(): Promise<void> {
    try {
      await this.api.post<void>('/api/auth/logout', {});
    } finally {
      this.api.clearSession();
      this.user.set(null);
      this.profile.set(null);
    }
  }

  async refreshProfile(): Promise<void> {
    if (this.user()) this.profile.set(await this.api.get<UserProfile>('/api/profiles/me'));
  }

  private async initialize(): Promise<void> {
    const user = await this.api.restoreSession();
    this.user.set(user);
    if (user) {
      try {
        this.profile.set(await this.api.get<UserProfile>('/api/profiles/me'));
      } catch {
        this.api.clearSession();
        this.user.set(null);
      }
    }
    this.loading.set(false);
  }
}
