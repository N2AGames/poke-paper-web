export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  email?: string;
  score: number;
  game_mode: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    picture?: string;
  };
}

export interface GameResult {
  score: number;
  gameMode: string;
  difficulty?: string;
}
