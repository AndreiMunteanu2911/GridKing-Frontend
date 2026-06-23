export type Color = 1 | 2;
export type Difficulty = 'easy' | 'medium' | 'hard';
export type BotPersonality = 'balanced' | 'aggressive' | 'defensive' | 'trickster';
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

export interface MatchMove {
  ply: number;
  color: Color;
  move: Move;
  captured_pieces: number[];
  state: GameState;
  played_at: string;
}

export interface MoveAnalysis {
  ply: number;
  played_move: Move;
  best_move: Move;
  score_before: number;
  score_after: number;
  score_loss: number;
  classification: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
}

export interface UserProfile {
  uid: string;
  username: string;
  visible_name: string;
  mmr: number;
  matches_played: number;
  wins: number;
  win_streak: number;
  best_win_streak: number;
  puzzle_streak: number;
  best_puzzle_streak: number;
  presence_visible: boolean;
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
  match_id: string;
  state: GameState;
  legal_moves: Move[];
  color: Color;
  history: MatchMove[];
  personality?: BotPersonality;
}

export interface MatchRecord {
  id: string;
  mode: 'pvp' | 'bot';
  red_uid: string;
  black_uid: string;
  red_name: string;
  black_name: string;
  winner_uid: string;
  ranked: boolean;
  invited: boolean;
  reason: string;
  initial_state: GameState;
  moves: MatchMove[];
  analysis?: MoveAnalysis[];
  analysis_status: 'processing' | 'complete';
  red_remaining_ms: number;
  black_remaining_ms: number;
  bot_difficulty?: Difficulty;
  bot_personality?: BotPersonality;
  created_at: string;
  ended_at: string;
}

export interface UserSummary {
  uid: string;
  username: string;
  visible_name: string;
  mmr: number;
}

export interface Friend {
  profile: UserSummary;
  since: string;
  online: boolean;
  in_game: boolean;
}

export interface FriendRequest {
  from: UserSummary;
  created_at: string;
}

export interface FriendInvite {
  id: string;
  inviter: UserProfile;
  ranked: boolean;
}

export interface DailyPuzzle {
  id: string;
  date: string;
  state: GameState;
  legal_moves: Move[];
  best_move?: Move;
  difficulty: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked_at: string;
}

export interface SocketEvent {
  type: 'queued' | 'match_found' | 'state' | 'game_over' | 'opponent_disconnected' | 'opponent_reconnected' | 'error' | 'rematch_requested' | 'rematch_waiting' | 'rematch_declined' | 'invite_sent' | 'invite_received' | 'invite_declined' | 'invite_expired';
  match_id?: string;
  color?: Color;
  state?: GameState;
  legal_moves?: Move[];
  opponent?: UserProfile;
  message?: string;
  history?: MatchMove[];
  ranked?: boolean;
  invited?: boolean;
  red_time_ms?: number;
  black_time_ms?: number;
  turn_deadline?: string;
  server_time?: string;
  reconnect_until?: string;
  invite_id?: string;
  inviter?: UserProfile;
}
