import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Color, GameState, Move, QueueMode, SocketEvent, UserProfile } from './models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { SoundService } from './sound.service';

@Injectable({ providedIn: 'root' })
export class MatchService {
  readonly status = signal<'idle' | 'connecting' | 'queued' | 'playing' | 'finished'>('idle');
  readonly state = signal<GameState | null>(null);
  readonly legalMoves = signal<Move[]>([]);
  readonly color = signal<Color | null>(null);
  readonly opponent = signal<UserProfile | null>(null);
  readonly error = signal('');
  private socket?: WebSocket;

  constructor(private readonly auth: AuthService, private readonly api: ApiService, private readonly sounds: SoundService) {}

  async connect(mode: QueueMode): Promise<void> {
    this.close();
    this.status.set('connecting');
    this.error.set('');
    const token = await this.api.getToken();
    this.socket = new WebSocket(`${environment.wsUrl}?token=${encodeURIComponent(token)}`);
    this.socket.onopen = () => this.send({ type: 'join_queue', mode });
    this.socket.onmessage = ({ data }) => this.handle(JSON.parse(data) as SocketEvent);
    this.socket.onerror = () => this.error.set('The real-time connection failed.');
    this.socket.onclose = () => {
      if (this.status() !== 'finished') this.status.set('idle');
    };
  }

  move(move: Move): void {
    this.send({ type: 'move', move });
  }

  resign(): void {
    this.send({ type: 'resign' });
  }

  close(): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.send({ type: 'leave_queue' });
    this.socket?.close();
    this.socket = undefined;
    this.status.set('idle');
  }

  private send(payload: unknown): void {
    this.socket?.send(JSON.stringify(payload));
  }

  private handle(event: SocketEvent): void {
    if (event.type === 'queued') this.status.set('queued');
    if (event.type === 'match_found') {
      this.status.set('playing');
      this.color.set(event.color || null);
      this.opponent.set(event.opponent || null);
      this.sounds.match();
    }
    if (event.state) this.state.set(event.state);
    if (event.legal_moves) this.legalMoves.set(event.legal_moves);
    if (event.type === 'game_over' || event.type === 'opponent_disconnected') {
      this.status.set('finished');
      if (event.state?.winner) event.state.winner === this.color() ? this.sounds.win() : this.sounds.lose();
      window.setTimeout(() => void this.auth.refreshProfile().catch(() => undefined), 700);
    }
    if (event.type === 'error') this.error.set(event.message || 'An unexpected match error occurred.');
  }
}
