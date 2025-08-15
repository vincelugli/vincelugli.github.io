import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '../Common/Button';
import { GateContainer, AuthBox, Input, ErrorMessage, Label, Select, DraftMetadataGroup } from '../../styles';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../Common/AuthContext';

interface DraftMeta {
  id: string;
  name: string;
}

const DraftAuthGate: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
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
      navigate(`/draft/${selectedDraftId}`);
      // The onAuthStateChanged listener will update the user state automatically
    } catch (err: any) {
      // navigate to draft as spectator if code is invalid
      sessionStorage.setItem("isSpectator", "true");
      navigate(`/draft/${selectedDraftId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSpectator = () => {
    sessionStorage.setItem("isSpectator", "true");
    navigate(`/draft/${selectedDraftId}`);
  };

  useEffect(() => {
    const fetchDrafts = async () => {
      const draftsRef = collection(db, 'draftsMetadata');
      const snapshot = await getDocs(draftsRef);
      const draftsList = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setDrafts(draftsList);

      // Set a default selection if drafts are available
      if (draftsList.length > 0) {
        setSelectedDraftId(draftsList[0].id);
      }
    };

    fetchDrafts().catch(console.error);
  }, []);

  useEffect(() => {
    if (!!captainTeamId) {
      navigate(`/draft/${!!selectedDraftId ? selectedDraftId : 'liveDraft'}`);
    }
  });
  
  // Otherwise, show the login gate
  return (
    <GateContainer>
      <AuthBox>
        <h2>Draft Access</h2>
        <DraftMetadataGroup>
          <Label htmlFor="draft-selection">Select Draft</Label>
          <Select
            id="draft-selection"
            value={selectedDraftId}
            onChange={(e: any) => setSelectedDraftId(e.target.value)}
            disabled={drafts.length === 0}
          >
            {drafts.length > 0 ? (
              drafts.map(draft => (
                <option key={draft.id} value={draft.id}>{draft.name}</option>
              ))
            ) : (
              <option>Loading drafts...</option>
            )}
          </Select>
        </DraftMetadataGroup>
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
