export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
}

export interface GroupMember {
  id: string;
  userId: string;
  user: User;
  joinedAt: string;
}

export interface Match {
  id: string;
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
  id: string;
  matchId: string;
  userId: string;
  homeScorePrediction: number;
  awayScorePrediction: number;
  points?: number;
  match?: Match;
  user?: User;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: User;
  totalPoints: number;
  betCount: number;
}

export interface MatchBreakdown {
  matchId: string;
  match: Match;
  bet?: Bet;
  points: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
