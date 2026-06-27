import api from './client';
import type {
  AuthResponse,
  User,
  Group,
  GroupDetail,
  Match,
  Bet,
  LeaderboardEntry,
  MatchBreakdown,
} from '../types';

// Auth
export const authGoogle = async (credential: string): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/google', { credential });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get('/auth/me');
  return data;
};

// Groups
export const createGroup = async (name: string): Promise<Group> => {
  const { data } = await api.post('/groups', { name });
  return data;
};

export const getGroups = async (): Promise<Group[]> => {
  const { data } = await api.get('/groups');
  return data;
};

export const getGroupDetail = async (id: string): Promise<GroupDetail> => {
  const { data } = await api.get(`/groups/${id}`);
  return data;
};

export const joinGroup = async (inviteCode: string): Promise<Group> => {
  const { data } = await api.post(`/groups/join/${inviteCode}`);
  return data;
};

// Matches
export const getMatches = async (params?: {
  status?: string;
  stage?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Match[]> => {
  const { data } = await api.get('/matches', { params });
  return data;
};

export const getMatch = async (id: string): Promise<Match> => {
  const { data } = await api.get(`/matches/${id}`);
  return data;
};

// Bets
export const placeBet = async (
  groupId: string,
  bet: { matchId: number; homeScorePrediction: number; awayScorePrediction: number }
): Promise<Bet> => {
  const { data } = await api.post(`/groups/${groupId}/bets`, bet);
  return data;
};

export const getMyBets = async (groupId: string): Promise<Bet[]> => {
  const { data } = await api.get(`/groups/${groupId}/bets`);
  return data;
};

export const getMatchBets = async (groupId: string, matchId: string): Promise<Bet[]> => {
  const { data } = await api.get(`/groups/${groupId}/bets/matches/${matchId}`);
  return data;
};

// Leaderboard
export const getLeaderboard = async (groupId: string): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get(`/groups/${groupId}/leaderboard`);
  return data;
};

export const getUserBreakdown = async (
  groupId: string,
  userId: number | string
): Promise<MatchBreakdown[]> => {
  const { data } = await api.get(`/groups/${groupId}/leaderboard/${userId}`);
  return data;
};
