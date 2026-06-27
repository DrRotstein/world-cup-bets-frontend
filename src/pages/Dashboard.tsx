import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getGroups, createGroup, joinGroup } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setNewGroupName('');
      setShowCreate(false);
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setInviteCode('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createMutation.mutate(newGroupName.trim());
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      joinMutation.mutate(inviteCode.trim());
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Groups</h1>
        <div className="flex items-center gap-1">
          {user?.picture && <img src={user.picture} alt="" className="avatar-sm avatar" />}
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {/* Join Group */}
      <form onSubmit={handleJoin} className="input-group mb-1">
        <input
          className="input"
          type="text"
          placeholder="Paste invite code..."
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!inviteCode.trim() || joinMutation.isPending}
        >
          Join
        </button>
      </form>
      {joinMutation.isError && (
        <p className="text-sm" style={{ color: 'var(--color-error)' }}>
          Could not join group. Check the invite code.
        </p>
      )}

      {/* Create Group toggle */}
      {!showCreate ? (
        <button className="btn btn-accent btn-block mt-1 mb-1" onClick={() => setShowCreate(true)}>
          + Create New Group
        </button>
      ) : (
        <form onSubmit={handleCreate} className="card mt-1 mb-1">
          <label className="text-sm text-secondary mb-1" style={{ display: 'block' }}>
            Group name
          </label>
          <div className="input-group">
            <input
              className="input"
              type="text"
              placeholder="e.g. Office Legends"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!newGroupName.trim() || createMutation.isPending}
            >
              Create
            </button>
          </div>
          {createMutation.isError && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>
              Failed to create group.
            </p>
          )}
        </form>
      )}

      {/* Groups List */}
      {isLoading && <div className="empty-state">Loading groups...</div>}
      {error && <div className="error-state">Failed to load groups.</div>}
      {groups && groups.length === 0 && (
        <div className="empty-state">
          <p>No groups yet.</p>
          <p className="text-sm mt-1">Create one or join with an invite code!</p>
        </div>
      )}
      {groups?.map((group) => (
        <Link to={`/groups/${group.id}`} key={group.id} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div className="flex justify-between items-center">
              <div>
                <strong>{group.name}</strong>
                <p className="text-sm text-secondary">{group.memberCount} members</p>
              </div>
              <span className="text-secondary">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
