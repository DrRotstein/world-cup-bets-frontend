import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinGroup } from '../api/endpoints';

/**
 * Handles shared invite links: /join/:inviteCode
 *
 * - If authenticated → join group immediately → redirect to group
 * - If not authenticated → store invite code → redirect to login
 *   (post-login join handled via PENDING_INVITE_CODE in localStorage)
 */
export default function JoinGroup() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { token, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      // Store invite code for post-login join
      if (inviteCode) {
        localStorage.setItem('PENDING_INVITE_CODE', inviteCode);
      }
      navigate('/', { replace: true });
      return;
    }

    // Authenticated — join the group
    if (inviteCode && !joining) {
      setJoining(true);
      joinGroup(inviteCode)
        .then((group) => {
          navigate(`/groups/${group.id}`, { replace: true });
        })
        .catch((err) => {
          if (err.response?.status === 409) {
            // Already a member — just go to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            setError('Could not join group. The invite link may be invalid or expired.');
          }
        });
    }
  }, [token, authLoading, inviteCode, navigate, joining]);

  if (authLoading || joining) {
    return <div className="loading-screen">Joining group...</div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <div className="loading-screen">Redirecting...</div>;
}
