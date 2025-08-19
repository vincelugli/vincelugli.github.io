import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { BracketRound, Group, Player, SubPlayer, Team } from '../../types';
import Button from '../Common/Button';
import { useNavigate } from 'react-router-dom';
import { AdminPageContainer, AdminTitle, Form, TextArea, SelectionContainer, FormGroup, AdminLabel, AdminSelect } from '../../styles/index';
import { useDivision } from '../../context/DivisionContext';
import { z } from 'zod';
import { useAuth } from '../Common/AuthContext';

const StatusMessage = styled.p<{ status: 'success' | 'error' }>` /* ... same as other pages ... */ `;

// --- Component Definition ---

type DataType = 'players' | 'teams' | 'groups' | 'bracket' | 'subs';

const PLAYER_JSON_PLACEHOLDER = `[
  {
    "id": 101,
    "name": "NewPlayer1",
    "rankTier": "Diamond"
    "rankDivision": 2,
    "primaryRole": "top",
    "secondaryRoles": ["mid"],
    "isCaptain": false
  },
  {
    "id": 102,
    "name": "NewPlayer2",
    "rankTier": "Diamond",
    "rankDivision": 1,
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

const SUBS_JSON_PLACEHOLDER = `[{}]`

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const { division } = useDivision();
    const { isAdmin } = useAuth();
    
    const [selectedType, setSelectedType] = useState<DataType>('players');
    const [jsonString, setJsonString] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [loadingAuth, setLoadingAuth] = useState(true);

    const PlayerSchema = z.array(z.object({
        id: z.number(),
        name: z.string().min(1, { message: "Name cannot be empty" }),
        rankTier: z.string(),
        rankDivision: z.number(),
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
        rankTier: z.string(),
        rankDivision: z.number(),
        contact: z.string(),
        role: z.string(),
        secondaryRoles: z.array(z.string())
    }))

    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin-access')
        }
        setLoadingAuth(false);
    }, [isAdmin, navigate, setLoadingAuth]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setStatusMessage('');

        let data: Player[] | Team[] | Group[] | BracketRound[] | SubPlayer[];
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
            // Get a new write batch
            const docRef = doc(db, selectedType === 'subs' ? 'players' : selectedType, `grumble2025_${division}`);

            await updateDoc(docRef, {
                [selectedType]: arrayUnion(...data)
            });

            setStatus('success');
            setStatusMessage(`Successfully created or updated ${data.length} ${selectedType}.`);
            setJsonString(''); // Clear the text area on success
        } catch (error) {
            console.error("Error committing batch:", error);
            setStatus('error');
            setStatusMessage(`Failed to write ${selectedType} to the database. Check the console.`);
        }

    }, [division, jsonString, selectedType, PlayerSchema, TeamSchema, GroupsSchema, BracketSchema, SubsSchema]);

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
            default: 
                return '';
        }
    }

    if (loadingAuth) {
        return <div>Verifying Access...</div>;
    }

    return (
        <AdminPageContainer>
            <AdminTitle>Admin: Bulk {selectedType} Creation</AdminTitle>

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
                </AdminSelect>
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
        </AdminPageContainer>
    );
};

export default AdminPage;
