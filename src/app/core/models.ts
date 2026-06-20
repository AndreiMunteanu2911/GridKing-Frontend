export type Color = 1 | 2;
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QueueMode = 'casual' | 'ranked';

export interface Move {
  path: number[];
}

export interface GameState {
  board: number[];
  turn: Color;
  winner?: Color;
  reason?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  visible_name: string;
  mmr: number;
  matches_played: number;
  wins: number;
}

export interface AuthUser {
  uid: string;
  email?: string;
}

export interface SessionPayload {
  user: AuthUser;
  profile?: UserProfile;
  id_token: string;
  refresh_token: string;
  expires_in: string;
}

export interface GamePayload {
  state: GameState;
  legal_moves: Move[];
  color: Color;
}

export interface SocketEvent {
  type: 'queued' | 'match_found' | 'state' | 'game_over' | 'opponent_disconnected' | 'error';
  match_id?: string;
  color?: Color;
  state?: GameState;
  legal_moves?: Move[];
  opponent?: UserProfile;
  message?: string;
}
