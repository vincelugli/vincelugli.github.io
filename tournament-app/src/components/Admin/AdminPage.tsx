import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Player } from '../../types'; // Assuming your Player type is defined and exported
import Button from '../Common/Button';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// --- Styled Components (consistent with the rest of the app) ---

const PageContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  font-size: 2.8rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  min-height: 400px;
  resize: vertical;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const StatusMessage = styled.p<{ status: 'success' | 'error' }>` /* ... same as other pages ... */ `;

// --- Component Definition ---

type FormStatus = 'idle' | 'loading' | 'success' | 'error';
const JSON_PLACEHOLDER = `[
  {
    "id": 101,
    "name": "NewPlayer1",
    "elo": 2200,
    "primaryRole": "top",
    "secondaryRoles": ["mid"],
    "isCaptain": false
  },
  {
    "id": 102,
    "name": "NewPlayer2",
    "elo": 2350,
    "primaryRole": "adc",
    "secondaryRoles": [],
    "isCaptain": false
  }
]`;

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    const [jsonString, setJsonString] = useState('');
    const [status, setStatus] = useState<FormStatus>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async currentUser => {
            const idTokenResult = await currentUser?.getIdTokenResult();
            // user is NOT logged in, redirect them
            if (!currentUser || !idTokenResult?.claims.adminId) {
                navigate('/admin-access');
            }
            setLoadingAuth(false);
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setStatusMessage('');

        let playersData: Player[];
        try {
            playersData = JSON.parse(jsonString);
            if (!Array.isArray(playersData)) {
                throw new Error("JSON data must be an array.");
            }
        } catch (error) {
            setStatus('error');
            setStatusMessage(error instanceof Error ? error.message : "Invalid JSON format.");
            return;
        }

        try {
            // Get a new write batch
            const docRef = doc(db, 'players', 'grumble2025');

            await updateDoc(docRef, {
                players: arrayUnion(...playersData)
            });

            setStatus('success');
            setStatusMessage(`Successfully created or updated ${playersData.length} players.`);
            setJsonString(''); // Clear the text area on success
        } catch (error) {
            console.error("Error committing batch:", error);
            setStatus('error');
            setStatusMessage("Failed to write players to the database. Check the console.");
        }

    }, [jsonString]);

    if (loadingAuth) {
        return <div>Verifying Access...</div>;
    }

    return (
        <PageContainer>
            <Title>Admin: Bulk Player Creation</Title>
            <p>Enter an array of player objects in JSON format. Each player object will be created as a new document in the "players" collection. The player's `id` field will be used as the document ID.</p>
            <Form onSubmit={handleSubmit}>
                <TextArea
                    value={jsonString}
                    onChange={(e) => setJsonString(e.target.value)}
                    placeholder={JSON_PLACEHOLDER}
                    required
                />
                <Button type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Processing...' : 'Create Players'}
                </Button>

                {statusMessage && (
                    <StatusMessage status={status === 'success' ? 'success' : 'error'}>
                        {statusMessage}
                    </StatusMessage>
                )}
            </Form>
        </PageContainer>
    );
};

export default AdminPage;
