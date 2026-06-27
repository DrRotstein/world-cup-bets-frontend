import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLeaderboard, getUserBreakdown } from '../api/endpoints';
import type { LeaderboardEntry } from '../types';

export default function Leaderboard() {
  const { groupId } = useParams<{ groupId: string }>();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  if (!groupId) return null;

  return (
    <div className="page">
      <Link to={`/groups/${groupId}`} className="back-link">
        ← Back to group
      </Link>
      <div className="page-header">
        <h1 className="page-title">Leaderboard</h1>
      </div>
      <LeaderboardContent groupId={groupId} expandedUser={expandedUser} setExpandedUser={setExpandedUser} />
    </div>
  );
}

function LeaderboardContent({
  groupId,
  expandedUser,
  setExpandedUser,
}: {
  groupId: string;
  expandedUser: string | null;
  setExpandedUser: (u: string | null) => void;
}) {
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard', groupId],
    queryFn: () => getLeaderboard(groupId),
  });

  if (isLoading) return <div className="empty-state">Loading leaderboard...</div>;
  if (error) return <div className="error-state">Failed to load leaderboard.</div>;
  if (!leaderboard || leaderboard.length === 0) {
    return <div className="empty-state">No standings yet. Place some bets!</div>;
  }

  return (
    <div>
      {leaderboard.map((entry) => (
        <LeaderboardRow
          key={entry.userId}
          entry={entry}
          groupId={groupId}
          isExpanded={expandedUser === entry.userId}
          onToggle={() => setExpandedUser(expandedUser === entry.userId ? null : entry.userId)}
        />
      ))}
    </div>
  );
}

function LeaderboardRow({
  entry,
  groupId,
  isExpanded,
  onToggle,
}: {
  entry: LeaderboardEntry;
  groupId: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card" style={{ marginBottom: '0.5rem' }}>
      <div
        className="lb-row"
        style={{ cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none' }}
        onClick={onToggle}
      >
        <span className={`rank ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}>
          {entry.rank}
        </span>
        {entry.user.picture && <img src={entry.user.picture} alt="" className="avatar avatar-sm" />}
        <span className="lb-name">{entry.user.name}</span>
        <span className="lb-points">{entry.totalPoints} pts</span>
        <span className="text-secondary">{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && <BreakdownPanel groupId={groupId} userId={entry.userId} />}
    </div>
  );
}

function BreakdownPanel({ groupId, userId }: { groupId: string; userId: string }) {
  const { data: breakdown, isLoading } = useQuery({
    queryKey: ['breakdown', groupId, userId],
    queryFn: () => getUserBreakdown(groupId, userId),
    enabled: true,
  });

  if (isLoading) return <div className="text-sm text-secondary" style={{ padding: '0.5rem' }}>Loading...</div>;
  if (!breakdown || breakdown.length === 0) {
    return <div className="text-sm text-secondary" style={{ padding: '0.5rem' }}>No match data yet.</div>;
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {breakdown.map((item) => (
        <div
          key={item.matchId}
          className="flex justify-between items-center"
          style={{ padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}
        >
          <span>
            {item.match.homeTeam} vs {item.match.awayTeam}
          </span>
          <span>
            {item.bet ? (
              <>
                {item.bet.homeScorePrediction}–{item.bet.awayScorePrediction}
                {' → '}
                <strong style={{ color: item.points > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                  {item.points} pts
                </strong>
              </>
            ) : (
              <span className="text-secondary">No bet</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
