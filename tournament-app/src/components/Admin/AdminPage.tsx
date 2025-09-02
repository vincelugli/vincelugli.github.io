import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { arrayUnion, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { BracketRound, Group, Player, SubPlayer, Team, TournamentCode } from '../../types';
import Button from '../Common/Button';
import { useNavigate } from 'react-router-dom';
import { AdminPageContainer, AdminTitle, Form, TextArea, SelectionContainer, FormGroup, AdminLabel, AdminSelect } from '../../styles/index';
import { useDivision } from '../../context/DivisionContext';
import { z } from 'zod';
import { useAuth } from '../Common/AuthContext';

const StatusMessage = styled.p<{ status: 'success' | 'error' }>` /* ... same as other pages ... */ `;
const JsonOutput = styled.pre`
  background-color: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 5px;
  padding: 1rem;
  font-size: 0.9rem;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap; /* Allows text to wrap */
  word-break: break-all; /* Breaks long strings */
  max-height: 500px;
  overflow-y: auto;
  margin-top: 1rem;
`;

const ActionContainer = styled.div`
  margin-top: 1rem;
`;

// --- Component Definition ---

type DataType = 'players' | 'teams' | 'groups' | 'bracket' | 'subs' | 'exportTeams' | 'matches' | 'matchCodes';

const PLAYER_JSON_PLACEHOLDER = `[
  {
    "id": 101,
    "name": "NewPlayer1",
    "soloRankTier": "Diamond"
    "soloRankDivision": 2,
    "primaryRole": "top",
    "secondaryRoles": ["mid"],
    "isCaptain": false
  },
  {
    "id": 102,
    "name": "NewPlayer2",
    "soloRankTier": "Diamond",
    "soloRankDivision": 1,
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

const SUBS_JSON_PLACEHOLDER = `[{}]`;


const MATCHES_JSON_PLACEHOLDER = `[{
    id: 'm2',
    team1Id: 1,
    team2Id: 3,
    status: 'upcoming',
    tournamentCode: 'ABC789',
    weekPlayed: 1
  },
]`;

const MATCH_CODES_JSON_PLACEHOLDER = `[{
    code: "NA123",
    matchId: 1,
    division: "master"
}]`

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const { division } = useDivision();
    const { isAdmin } = useAuth();
    
    const [selectedType, setSelectedType] = useState<DataType>('players');
    const [jsonString, setJsonString] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [exportJson, setExportJson] = useState('');
    const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [exportMessage, setExportMessage] = useState('');
    const [copied, setCopied] = useState(false);

    const PlayerSchema = z.array(z.object({
        id: z.number(),
        name: z.string().min(1, { message: "Name cannot be empty" }),
        peakRankTier: z.string(),
        peakRankDivision: z.number(),
        soloRankTier: z.string(),
        soloRankDivision: z.number(),
        flexRankTier: z.string(),
        flexRankDivision: z.number(),
        role: z.string(),
        secondaryRoles: z.array(z.string()),
        isCaptain: z.boolean()
    }));

    
    const TeamSchema = z.array(z.object({
        id: z.number(),
        name: z.string(),
        captainId: z.number(),
        players: z.array(z.number()),
        record: z.string(),
        wins: z.number(),
        losses: z.number(),
        gameWins: z.number(),
        gameLosses: z.number(),
        gameRecord: z.string()
    }));

    const GroupsSchema = z.array(z.object({
        id: z.number(),
        name: z.string(), 
        teams: z.array(z.number())
    }));

    const BracketSchema = z.array(z.object({
        title: z.string(),
        seeds: z.array(z.object({
            id: z.number(), 
            teams: z.array(z.object({
                name: z.string()
            }))
        }))
    }));

    const SubsSchema = z.array(z.object({
        name: z.string(),
        peakRankTier: z.string(),
        peakRankDivision: z.number(),
        soloRankTier: z.string(),
        soloRankDivision: z.number(),
        flexRankTier: z.string(),
        flexRankDivision: z.number(),
        contact: z.string(),
        role: z.string(),
        secondaryRoles: z.array(z.string())
    }));

    const MatchesSchema = z.array(z.object({
        id: z.number(),
        team1Id: z.number(),
        team2Id: z.number(),
        status: z.string(),
        tournamentCode: z.string(),
        winner: z.optional(z.number()),
        score: z.optional(z.string())
    }));

    const MatchCodesSchema = z.array(z.object({
        matchId: z.number(),
        code: z.string(),
    }))

    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin-access')
        }
        setLoadingAuth(false);
    }, [isAdmin, navigate, setLoadingAuth]);

    const handleFetchTeams = useCallback(async () => {
        setExportStatus('loading');
        setExportMessage('');
        setExportJson('');
        setCopied(false);

        try {
        const docRef = doc(db, 'drafts', 'grumble2025_master');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.teams && Array.isArray(data.teams)) {
                // Format the JSON with an indentation of 2 spaces for readability
                const formattedJson = JSON.stringify(data.teams, null, 2);
                setExportJson(formattedJson);
                setExportStatus('success');
            } else {
                throw new Error("'teams' field is missing or not an array in the document.");
            }
        } else {
            throw new Error("Document 'drafts/grumble2025_master' not found.");
        }
        } catch (error) {
            console.error("Error fetching teams data:", error);
            setExportStatus('error');
            setExportMessage(error instanceof Error ? error.message : "An unknown error occurred.");
        }
    }, []);


    const handleCopy = () => {
        navigator.clipboard.writeText(exportJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setStatusMessage('');

        let data: Player[] | Team[] | Group[] | BracketRound[] | SubPlayer[] | TournamentCode[];
        try {
            data = JSON.parse(jsonString);
            if (!Array.isArray(data)) {
                throw new Error("JSON data must be an array.");
            }
            switch(selectedType) {
                case 'players':
                    PlayerSchema.parse(data);
                    break;
                case 'teams':
                    TeamSchema.parse(data);
                    break;
                case 'groups':
                    GroupsSchema.parse(data);
                    break;
                case 'bracket':
                    BracketSchema.parse(data);
                    break;
                case 'subs':
                    SubsSchema.parse(data);
                    break;
                case 'matches':
                    MatchesSchema.parse(data);
                    break;
                case 'matchCodes': 
                    MatchCodesSchema.parse(data);
                    break;
                default: 
                    return '';
            }
        } catch (error) {
            setStatus('error');
            if (error instanceof z.ZodError) {
                setStatusMessage(`Validation Failed: ${error.format()}`);
                return;
            }
            setStatusMessage(error instanceof Error ? error.message : "Invalid JSON format.");
            return;
        }

        try {
            if (selectedType === 'matchCodes') {
                // write in batch
                const batch = writeBatch(db)

                for (const code of data) {
                    const tournamentCode = code as TournamentCode;
                    const matchRef = doc(db, 'matches', tournamentCode.code);
                    batch.set(matchRef, { matchId: tournamentCode.matchId, division });
                }
                
                await batch.commit();
            } else {
                const docRef = doc(db, selectedType === 'subs' ? 'players' : selectedType, `grumble2025_${division}`);
                await updateDoc(docRef, {
                    [selectedType]: arrayUnion(...data)
                });
            }


            setStatus('success');
            setStatusMessage(`Successfully created or updated ${data.length} ${selectedType}.`);
            setJsonString(''); // Clear the text area on success
        } catch (error) {
            console.error("Error committing batch:", error);
            setStatus('error');
            setStatusMessage(`Failed to write ${selectedType} to the database. Check the console.`);
        }

    }, [division, jsonString, selectedType, PlayerSchema, TeamSchema, GroupsSchema, BracketSchema, SubsSchema, MatchesSchema, MatchCodesSchema]);

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
            case 'subs':
                return SUBS_JSON_PLACEHOLDER;
            case 'matches':
                return MATCHES_JSON_PLACEHOLDER;
            case 'matchCodes':
                return MATCH_CODES_JSON_PLACEHOLDER;
            default: 
                return '';
        }
    }

    if (loadingAuth) {
        return <div>Verifying Access...</div>;
    }

    const renderAdminForm = () => {
        switch (selectedType) {
            case 'teams':
            case 'subs':
            case 'bracket':
            case 'groups':
            case 'matches':
            case 'matchCodes':
            case 'players':
                return (
                    <div>
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
                    </div>
                );
            case 'exportTeams':
                return (
                <div>
                    <h3>Export Team Rosters from Draft</h3>
                    <p>Click the button below to fetch the `teams` field from the `drafts/grumble2025_test` document and display it as JSON.</p>
                    <ActionContainer>
                    <Button onClick={handleFetchTeams} disabled={exportStatus === 'loading'}>
                        {exportStatus === 'loading' ? 'Fetching...' : 'Fetch and Print Teams'}
                    </Button>
                    {exportJson && (
                        <Button onClick={handleCopy} style={{ marginLeft: '1rem', background: '#28a745' }}>
                        {copied ? 'Copied!' : 'Copy JSON'}
                        </Button>
                    )}
                    </ActionContainer>
                    
                    {exportStatus === 'error' && <StatusMessage status="error">{exportMessage}</StatusMessage>}
                    {exportJson && <JsonOutput>{exportJson}</JsonOutput>}
                </div>
                );
            default:
                return <div><h3>Manage {selectedType}</h3><p>Management form will be here.</p></div>;
        }
    };


    return (
    <AdminPageContainer>
      <AdminTitle>Admin Dashboard</AdminTitle>
        <SelectionContainer>
            <FormGroup>
            <AdminLabel htmlFor="data-type-select">Select Data to Manage</AdminLabel>
            <AdminSelect
                id="data-type-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DataType)}
            >
                <option value="players">Players</option>
                <option value="teams">Teams</option>
                <option value="groups">Groups</option>
                <option value="bracket">Bracket</option>
                <option value="subs">Subs</option>
                <option value="matches">Matches</option>
                <option value="exportTeams">Export Teams</option>
                <option value="matchCodes">Match Codes</option>
            </AdminSelect>
            </FormGroup>
        </SelectionContainer>

      {renderAdminForm()}
      
      {/* Conditionally show player status message if that was the last action */}
      {statusMessage && (
                    <StatusMessage status={status === 'success' ? 'success' : 'error'}>
                        {statusMessage}
                    </StatusMessage>
      )}
    </AdminPageContainer>

    );
};

export default AdminPage;
