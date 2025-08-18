import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '../Common/Button';
import { GateContainer, AuthBox, Input, ErrorMessage } from '../../styles';
import { useAuth } from '../Common/AuthContext';

const DraftAuthGate: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { captainTeamId } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const functions = getFunctions();
      const getToken = httpsCallable(functions, 'getAuthTokenForAccessCode');
      const result = await getToken({ accessCode });
      const token = (result.data as { token: string }).token;
      
      await signInWithCustomToken(auth, token);

      sessionStorage.setItem("isSpectator", "false");
      navigate(`/draft`);
      // The onAuthStateChanged listener will update the user state automatically
    } catch (err: any) {
      // navigate to draft as spectator if code is invalid
      sessionStorage.setItem("isSpectator", "true");
      navigate(`/draft`);
    } finally {
      setLoading(false);
    }
  };

  const handleSpectator = () => {
    sessionStorage.setItem("isSpectator", "true");
    navigate(`/draft`);
  };

  useEffect(() => {
    if (!!captainTeamId) {
      navigate(`/draft`);
    }
  });
  
  // Otherwise, show the login gate
  return (
    <GateContainer>
      <AuthBox>
        <h2>Draft Access</h2>
        <Input 
          id="team-access-code"
          type="text" 
          placeholder="Enter Team Access Code"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button onClick={handleLogin} disabled={loading} variant="primary">
          {loading ? 'Verifying...' : 'Enter as Captain'}
        </Button>
        <Button onClick={handleSpectator} disabled={loading} variant="secondary">
          Continue as Spectator
        </Button>
      </AuthBox>
    </GateContainer>
  );
};

export default DraftAuthGate;
