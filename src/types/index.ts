export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Group {
  id: number;
  name: string;
  inviteCode: string;
  ownerId: number;
  memberCount: number;
  createdAt: string;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
}

export interface GroupMember {
  id: number;
  userId: number;
  user: User;
  joinedAt: string;
}

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  stage: string;
  status: 'scheduled' | 'live' | 'finished';
  kickoffTime: string;
  venue?: string;
}

export interface Bet {
  id: number;
  matchId: number;
  userId: number;
  homeScorePrediction: number;
  awayScorePrediction: number;
  points?: number;
  match?: Match;
  user?: User;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  user: User;
  totalPoints: number;
  betCount: number;
}

export interface MatchBreakdown {
  matchId: number;
  match: Match;
  bet?: Bet;
  points: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
