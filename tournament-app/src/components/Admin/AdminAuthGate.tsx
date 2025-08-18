import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '../Common/Button';
import { GateContainer, AuthBox, Input, ErrorMessage } from '../../styles';
import { useAuth } from '../Common/AuthContext';

const AdminAuthGate: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  })

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const functions = getFunctions();
      const getToken = httpsCallable(functions, 'getAuthTokenForAdminAccessCode');
      const result = await getToken({ accessCode });
      const token = (result.data as { token: string }).token;
      
      await signInWithCustomToken(auth, token);
      navigate(`/admin`);
      // The onAuthStateChanged listener will update the user state automatically
    } catch (err: any) {
      // navigate to draft as pectator if code is invalid
      setError(err.message || 'Invalid access code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GateContainer>
      <AuthBox>
        <h2>Admin Access</h2>
        <Input 
          id="admin-access-code"
          type="text" 
          placeholder="Enter Admin Access Code"
          value={accessCode}
          onChange={(e: any) => setAccessCode(e.target.value)}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button onClick={handleLogin} disabled={loading} variant="primary">
          {loading ? 'Verifying...' : 'Enter'}
        </Button>
      </AuthBox>
    </GateContainer>
  );
};

export default AdminAuthGate;
