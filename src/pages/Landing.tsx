import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authGoogle } from '../api/endpoints';
import { useState } from 'react';

export default function Landing() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    try {
      const { token } = await authGoogle(credentialResponse.credential);
      login(token);
    } catch {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="landing">
      <div className="landing-emoji">⚽</div>
      <h1 className="landing-title">World Cup Bets</h1>
      <p className="landing-subtitle">
        Predict scores, compete with friends, and prove you&apos;re the real football expert.
      </p>

      {error && <p className="error-state mb-1">{error}</p>}

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError('Google sign-in failed.')}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
}
