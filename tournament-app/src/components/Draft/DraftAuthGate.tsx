import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styled from 'styled-components';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '../Common/Button';

// --- Styled Components for the Gate ---
const GateContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
`;

const AuthBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box; /* Important for consistent sizing */
`;
const ErrorMessage = styled.p` color: red; `;


const DraftAuthGate: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const functions = getFunctions();
      const getToken = httpsCallable(functions, 'getAuthTokenForAccessCode');
      const result = await getToken({ accessCode });
      const token = (result.data as { token: string }).token;
      
      await signInWithCustomToken(auth, token);
      navigate('/draft');
      // The onAuthStateChanged listener will update the user state automatically
    } catch (err: any) {
      setError(err.message || 'Invalid access code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpectator = () => {
    sessionStorage.setItem("isSpectator", "true");
    navigate('/draft');
  };
  
  // Otherwise, show the login gate
  return (
    <GateContainer>
      <AuthBox>
        <h2>Draft Access</h2>
        <Input 
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