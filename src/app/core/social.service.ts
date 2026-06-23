import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Friend, FriendRequest, UserSummary } from './models';

@Injectable({ providedIn: 'root' })
export class SocialService {
  readonly friends = signal<Friend[]>([]);
  readonly requests = signal<FriendRequest[]>([]);
  readonly results = signal<UserSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  constructor(private readonly api: ApiService) {}

  async refresh(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try {
      const [friends, requests] = await Promise.all([this.api.get<Friend[]>('/api/friends'), this.api.get<FriendRequest[]>('/api/friends/requests')]);
      this.friends.set(friends); this.requests.set(requests);
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Could not load friends.'); }
    finally { this.loading.set(false); }
  }

  async search(query: string): Promise<void> {
    if (query.trim().length < 2) { this.results.set([]); return; }
    this.results.set(await this.api.get<UserSummary[]>(`/api/friends/search?q=${encodeURIComponent(query.trim())}`));
  }

  async request(uid: string): Promise<void> { await this.api.post<void>('/api/friends/request', { uid }); this.results.update((players) => players.filter((player) => player.uid !== uid)); }
  async respond(uid: string, accept: boolean): Promise<void> { await this.api.post<void>('/api/friends/respond', { uid, accept }); await this.refresh(); }
  async remove(uid: string): Promise<void> { await this.api.delete<void>(`/api/friends/${encodeURIComponent(uid)}`); await this.refresh(); }
}
