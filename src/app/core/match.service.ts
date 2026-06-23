import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Color, FriendInvite, GameState, MatchMove, Move, QueueMode, SocketEvent, UserProfile } from './models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { SoundService } from './sound.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class MatchService {
  readonly status = signal<'idle' | 'connecting' | 'queued' | 'playing' | 'finished'>('idle');
  readonly state = signal<GameState | null>(null);
  readonly legalMoves = signal<Move[]>([]);
  readonly history = signal<MatchMove[]>([]);
  readonly color = signal<Color | null>(null);
  readonly opponent = signal<UserProfile | null>(null);
  readonly matchId = signal('');
  readonly ranked = signal(false);
  readonly invited = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly rematchState = signal<'idle' | 'waiting' | 'requested'>('idle');
  readonly incomingInvite = signal<FriendInvite | null>(null);
  readonly inviteStatus = signal('');
  private readonly redBaseMS = signal(600_000);
  private readonly blackBaseMS = signal(600_000);
  private readonly deadlineMS = signal(0);
  private readonly serverOffsetMS = signal(0);
  private readonly tick = signal(Date.now());
  readonly redTimeMS = computed(() => this.remaining(1));
  readonly blackTimeMS = computed(() => this.remaining(2));
  private socket?: WebSocket;
  private connecting?: Promise<void>;
  private queuedMode?: QueueMode;
  private reconnectTimer?: number;
  private keepAlive = true;

  constructor(private readonly auth: AuthService, private readonly api: ApiService, private readonly sounds: SoundService, private readonly router: Router) {
    window.setInterval(() => this.tick.set(Date.now()), 250);
    void this.auth.ready.then(() => {
      if (this.auth.authenticated()) void this.ensureConnected().catch(() => undefined);
    });
  }

  async connect(mode: QueueMode): Promise<void> {
    this.keepAlive = true;
    this.leaveQueue();
    this.resetMatch();
    this.status.set('connecting');
    this.error.set('');
    this.queuedMode = mode;
    await this.ensureConnected();
    this.send({ type: 'join_queue', mode });
  }

  move(move: Move): void { this.send({ type: 'move', move }); }
  resign(): void { this.send({ type: 'resign' }); }

  requestRematch(): void {
    this.rematchState.set('waiting');
    this.send({ type: 'rematch' });
  }

  inviteFriend(friendUID: string, ranked: boolean): void {
    this.keepAlive = true;
    this.inviteStatus.set('Sending invitation...');
    void this.ensureConnected().then(() => this.send({ type: 'invite_friend', friend_uid: friendUID, ranked })).catch((error) => this.error.set(error instanceof Error ? error.message : 'Could not connect.'));
  }

  respondInvite(accept: boolean): void {
    const invite = this.incomingInvite();
    if (!invite) return;
    this.send({ type: 'respond_invite', invite_id: invite.id, accept });
    this.incomingInvite.set(null);
  }

  leaveQueue(): void {
    if (this.status() === 'queued' || this.status() === 'connecting') this.send({ type: 'leave_queue' });
    if (this.status() === 'queued' || this.status() === 'connecting') this.status.set('idle');
    this.queuedMode = undefined;
  }

  close(): void {
    this.leaveQueue();
    if (this.status() === 'finished') this.send({ type: 'leave_match' });
    this.resetMatch();
    this.status.set('idle');
  }

  disconnect(): void {
    this.keepAlive = false;
    this.leaveQueue();
    window.clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = undefined;
    this.resetMatch();
    this.status.set('idle');
  }

  private async ensureConnected(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;
    this.connecting = this.openSocket();
    try { await this.connecting; } finally { this.connecting = undefined; }
  }

  private async openSocket(): Promise<void> {
    const token = await this.api.getToken();
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(`${environment.wsUrl}?token=${encodeURIComponent(token)}`);
      this.socket = socket;
      socket.onopen = () => {
        resolve();
        if (this.queuedMode && this.status() === 'queued') this.send({ type: 'join_queue', mode: this.queuedMode });
      };
      socket.onmessage = ({ data }) => this.handle(JSON.parse(data) as SocketEvent);
      socket.onerror = () => reject(new Error('The real-time connection failed.'));
      socket.onclose = () => {
        if (this.socket === socket) this.socket = undefined;
        if (this.keepAlive && this.auth.authenticated()) {
          this.notice.set('Reconnecting...');
          this.reconnectTimer = window.setTimeout(() => void this.ensureConnected().catch(() => undefined), 1000);
        }
      };
    });
  }

  private send(payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload));
  }

  private handle(event: SocketEvent): void {
    if (event.type === 'queued') this.status.set('queued');
    if (event.type === 'match_found') {
      this.status.set('playing');
      this.matchId.set(event.match_id || '');
      this.color.set(event.color || null);
      this.opponent.set(event.opponent || null);
      this.ranked.set(!!event.ranked);
      this.invited.set(!!event.invited);
      this.rematchState.set('idle');
      this.notice.set('');
      this.queuedMode = undefined;
      this.sounds.match();
      if (event.invited) void this.router.navigateByUrl('/online');
    }
    if (event.state) this.state.set(event.state);
    if (event.legal_moves) this.legalMoves.set(event.legal_moves);
    if (event.history) this.history.set(event.history);
    this.updateClock(event);
    if (event.type === 'game_over') {
      this.status.set('finished');
      if (event.state?.winner) event.state.winner === this.color() ? this.sounds.win() : this.sounds.lose();
      window.setTimeout(() => void this.auth.refreshProfile().catch(() => undefined), 700);
    }
    if (event.type === 'opponent_disconnected') this.notice.set('Opponent disconnected. Their clock is still running; they have 30 seconds to return.');
    if (event.type === 'opponent_reconnected') this.notice.set('Opponent reconnected.');
    if (event.type === 'rematch_requested') this.rematchState.set('requested');
    if (event.type === 'rematch_waiting') this.rematchState.set('waiting');
    if (event.type === 'rematch_declined') { this.rematchState.set('idle'); this.notice.set('Opponent declined the rematch.'); }
    if (event.type === 'invite_received' && event.invite_id && event.inviter) this.incomingInvite.set({ id: event.invite_id, inviter: event.inviter, ranked: !!event.ranked });
    if (event.type === 'invite_sent') this.inviteStatus.set('Invitation sent. It expires in 60 seconds.');
    if (event.type === 'invite_declined') this.inviteStatus.set('Invitation declined.');
    if (event.type === 'invite_expired') {
      this.incomingInvite.set(null);
      this.inviteStatus.set('Invitation expired.');
    }
    if (event.type === 'error') this.error.set(event.message || 'An unexpected match error occurred.');
  }

  private updateClock(event: SocketEvent): void {
    if (event.red_time_ms === undefined || event.black_time_ms === undefined) return;
    this.redBaseMS.set(event.red_time_ms);
    this.blackBaseMS.set(event.black_time_ms);
    this.deadlineMS.set(event.turn_deadline ? Date.parse(event.turn_deadline) : 0);
    this.serverOffsetMS.set(event.server_time ? Date.parse(event.server_time) - Date.now() : 0);
    this.tick.set(Date.now());
  }

  private remaining(color: Color): number {
    this.tick();
    const base = color === 1 ? this.redBaseMS() : this.blackBaseMS();
    if (this.status() !== 'playing' || this.state()?.turn !== color || !this.deadlineMS()) return Math.max(0, base);
    return Math.max(0, this.deadlineMS() - (Date.now() + this.serverOffsetMS()));
  }

  private resetMatch(): void {
    this.state.set(null);
    this.history.set([]);
    this.legalMoves.set([]);
    this.color.set(null);
    this.opponent.set(null);
    this.matchId.set('');
    this.notice.set('');
    this.rematchState.set('idle');
  }
}
