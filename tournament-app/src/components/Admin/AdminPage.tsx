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

const SelectionContainer = styled.div`
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #555;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: white;
`;


const StatusMessage = styled.p<{ status: 'success' | 'error' }>` /* ... same as other pages ... */ `;

// --- Component Definition ---

type DataType = 'players' | 'teams' | 'groups' | 'bracket';

const PLAYER_JSON_PLACEHOLDER = `[
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
const TEAM_JSON_PLACEHOLDER = `[
  {
    "id": 1,
    "name": "TEAM 1",
    "captainId": 1,
    "players": [],
    "record": "2-0",
    "wins": 2,
    "losses": 0,
    "gameWins": 4,
    "gameLosses": 1,
    "gameRecord": "4-1"
  }
]`;

const GROUPS_JSON_PLACEHOLDER = `[
  {
    "id": 1, 
    "name": "Group A", 
    "teams": [1, 2, 3, 4]
  }
]`;

const BRACKET_JSON_PLACEHOLDER = `[
  {
    "title": "Finals",
    "seeds": [
        {
          "id": 3,
          "teams": []
        }
    ]
  }
]`;

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    
    const [selectedType, setSelectedType] = useState<DataType>('players');
    const [jsonString, setJsonString] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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
            const docRef = doc(db, selectedType, 'grumble2025');

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

    }, [jsonString, selectedType]);

    const getPlaceholder = () => {
        switch (selectedType) {
            case 'players':
                return PLAYER_JSON_PLACEHOLDER;
            case 'teams':
                return TEAM_JSON_PLACEHOLDER;
            case 'groups':
                return GROUPS_JSON_PLACEHOLDER;
            case 'bracket':
                return BRACKET_JSON_PLACEHOLDER;
            default: 
                return '';
        }
    }

    if (loadingAuth) {
        return <div>Verifying Access...</div>;
    }

    return (
        <PageContainer>
            <Title>Admin: Bulk {selectedType} Creation</Title>

            <SelectionContainer>
                <FormGroup>
                <Label htmlFor="data-type-select">Select Data to Manage</Label>
                <Select
                    id="data-type-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as DataType)}
                >
                    <option value="players">Players</option>
                    <option value="teams">Teams</option>
                    <option value="groups">Groups</option>
                    <option value="bracket">Bracket</option>
                </Select>
                </FormGroup>
            </SelectionContainer>
            
            <p>Enter an array {selectedType} objects in JSON format. Each player object will be created as a new document in the "{selectedType}" collection.</p>
            <Form onSubmit={handleSubmit}>
                <TextArea
                    value={jsonString}
                    onChange={(e) => setJsonString(e.target.value)}
                    placeholder={getPlaceholder()}
                    required
                />
                <Button type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Processing...' : 'Create Documents'}
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
