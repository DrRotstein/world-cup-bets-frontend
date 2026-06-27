import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGroupDetail, getMatches, getMyBets, placeBet, getLeaderboard } from '../api/endpoints';
import type { Match, Bet } from '../types';

type Tab = 'matches' | 'leaderboard' | 'members';

export default function GroupView() {
  const { groupId } = useParams<{ groupId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const [copied, setCopied] = useState(false);

  if (!groupId) return null;

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">
        ← Back
      </Link>
      <GroupContent groupId={groupId} activeTab={activeTab} setActiveTab={setActiveTab} copied={copied} setCopied={setCopied} />
    </div>
  );
}

function GroupContent({
  groupId,
  activeTab,
  setActiveTab,
  copied,
  setCopied,
}: {
  groupId: string;
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  copied: boolean;
  setCopied: (v: boolean) => void;
}) {
  const { data: group, isLoading, error } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroupDetail(groupId),
  });

  if (isLoading) return <div className="empty-state">Loading...</div>;
  if (error || !group) return <div className="error-state">Failed to load group.</div>;

  const inviteUrl = `${window.location.origin}/join/${group.inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{group.name}</h1>
      </div>

      {/* Invite link */}
      <div className="invite-box mb-1">
        <code>{inviteUrl}</code>
        <button className="btn btn-sm btn-primary" onClick={handleCopy}>
          {copied ? '✓' : 'Copy'}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members ({group.members?.length || group.memberCount})
        </button>
      </div>

      {activeTab === 'matches' && <MatchesTab groupId={groupId} />}
      {activeTab === 'leaderboard' && <LeaderboardTab groupId={groupId} />}
      {activeTab === 'members' && (
        <div>
          {group.members?.map((m) => (
            <div key={m.id} className="lb-row">
              {m.user.avatarUrl && <img src={m.user.avatarUrl} alt="" className="avatar avatar-sm" />}
              <span className="lb-name">{m.user.displayName}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MatchesTab({ groupId }: { groupId: string }) {
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => getMatches(),
  });

  const { data: myBets } = useQuery({
    queryKey: ['bets', groupId],
    queryFn: () => getMyBets(groupId),
  });

  if (matchesLoading) return <div className="empty-state">Loading matches...</div>;
  if (!matches || matches.length === 0) return <div className="empty-state">No matches scheduled yet.</div>;

  const betMap = new Map<number, Bet>();
  myBets?.forEach((b) => betMap.set(b.matchId, b));

  return (
    <div className="flex flex-col gap-1">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} existingBet={betMap.get(match.id)} groupId={groupId} />
      ))}
    </div>
  );
}

function MatchCard({ match, existingBet, groupId }: { match: Match; existingBet?: Bet; groupId: string }) {
  const queryClient = useQueryClient();
  const isLocked = new Date(match.kickoffTime) <= new Date();

  const [home, setHome] = useState<string>(existingBet?.homeScorePrediction?.toString() ?? '');
  const [away, setAway] = useState<string>(existingBet?.awayScorePrediction?.toString() ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      placeBet(groupId, {
        matchId: match.id,
        homeScorePrediction: parseInt(home),
        awayScorePrediction: parseInt(away),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets', groupId] });
    },
  });

  const canSubmit = home !== '' && away !== '' && !isNaN(parseInt(home)) && !isNaN(parseInt(away)) && !isLocked;
  const hasChanged =
    home !== (existingBet?.homeScorePrediction?.toString() ?? '') ||
    away !== (existingBet?.awayScorePrediction?.toString() ?? '');

  const statusBadge = match.status === 'live' ? 'badge-live' : match.status === 'finished' ? 'badge-finished' : 'badge-scheduled';

  return (
    <div className="card match-card">
      <div className="flex justify-between items-center">
        <span className="match-info">
          {match.stage} • {new Date(match.kickoffTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className={`badge ${statusBadge}`}>{match.status}</span>
      </div>

      <div className="match-teams">
        <span className="match-team">{match.homeTeam}</span>
        <span className="match-vs">vs</span>
        <span className="match-team">{match.awayTeam}</span>
      </div>

      {match.status === 'finished' && match.homeScore != null && (
        <div className="text-center text-sm text-secondary">
          Final: {match.homeScore} – {match.awayScore}
        </div>
      )}

      {isLocked ? (
        <div className="match-locked">
          🔒 Betting locked
          {existingBet && (
            <span> • Your bet: {existingBet.homeScorePrediction} – {existingBet.awayScorePrediction}</span>
          )}
        </div>
      ) : (
        <div className="match-bet-row">
          <input
            type="number"
            min="0"
            max="20"
            className="score-input"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            placeholder="0"
            aria-label={`${match.homeTeam} score prediction`}
          />
          <span className="text-secondary">–</span>
          <input
            type="number"
            min="0"
            max="20"
            className="score-input"
            value={away}
            onChange={(e) => setAway(e.target.value)}
            placeholder="0"
            aria-label={`${match.awayTeam} score prediction`}
          />
          <button
            className="btn btn-primary btn-sm"
            disabled={!canSubmit || !hasChanged || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? '...' : existingBet ? 'Update' : 'Save'}
          </button>
        </div>
      )}

      {mutation.isError && (
        <p className="text-sm" style={{ color: 'var(--color-error)' }}>Failed to save bet.</p>
      )}
      {mutation.isSuccess && hasChanged === false && (
        <p className="text-sm" style={{ color: 'var(--color-success)' }}>✓ Saved</p>
      )}
    </div>
  );
}

function LeaderboardTab({ groupId }: { groupId: string }) {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', groupId],
    queryFn: () => getLeaderboard(groupId),
  });

  if (isLoading) return <div className="empty-state">Loading...</div>;
  if (!leaderboard || leaderboard.length === 0) return <div className="empty-state">No standings yet.</div>;

  return (
    <div>
      {leaderboard.map((entry) => (
        <Link
          key={entry.userId}
          to={`/groups/${groupId}/leaderboard`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="lb-row">
            <span className={`rank ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}>
              {entry.rank}
            </span>
            {entry.user.avatarUrl && <img src={entry.user.avatarUrl} alt="" className="avatar avatar-sm" />}
            <span className="lb-name">{entry.user.displayName}</span>
            <span className="lb-points">{entry.totalPoints} pts</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
