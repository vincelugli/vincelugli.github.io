import React, { useEffect, useState } from 'react';
import MatchResult from './MatchResult';
import { Match, MatchResultData, Team } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams } from 'react-router-dom';
import { useGameMatches } from '../../context/MatchesContext';
import { useTournament } from '../../context/TournamentContext';
import { usePlayers } from '../../context/PlayerContext';

interface MatchResultProps {
    match?: Match;
    teams?: Team[];
}

const MatchResultPage: React.FC<MatchResultProps> = ({ match: propMatch, teams: propTeams }) => {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches } = useGameMatches();
  const { teams: contextTeams } = useTournament();
  const { players, substitutes } = usePlayers();

  const match = propMatch || matches.find(m => String(m.id) === matchId);
  const teams = propTeams || contextTeams;

  const [matchResults, setMatchResults] = useState(new Map<string, MatchResultData|undefined>());

  useEffect(() => {
    if (!match) return;
    match.tournamentCodes.forEach(async (tc) => {
      if (!matchResults.has(tc)) {
        const docRef = doc(db, 'match_results', `${tc}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          matchResults.set(tc, data as MatchResultData);
        } else {
          console.log(`Document 'match_results/${tc}' not found, the game may not have been played.`);
          matchResults.set(tc, undefined);
        }
        setMatchResults(new Map(matchResults));
      }
    });
  }, [match, matchResults]);

  const team1 = !!match && !!teams ? teams.find(t => t.id === match.team1Id) : undefined;
  const team2 = !!match && !!teams ? teams.find(t => t.id === match.team2Id) : undefined;

  if (!match) {
    return <>Match not found</>;
  }

  if (!match.tournamentCodes || match.tournamentCodes.length === 0) {
    return (
      <>
        <h1>{team1?.name + " vs " + team2?.name}</h1>
        <p style={{ padding: '1rem', fontStyle: 'italic' }}>No game data available for this match.</p>
      </>
    );
  }

  if (matchResults.size === 0) {
    return <>Loading match result...</>;
  }

  const matchesList = [];
  for (const entry of matchResults) {
    matchesList.push(entry);
  }

  const getSideNames = (result: MatchResultData | undefined) => {
    if (!result) return { blueTeamName: 'Blue Team', redTeamName: 'Red Team' };

    const isNameMatch = (n1: string, n2: string) => {
      const clean1 = n1.toLowerCase().replace(/\s+/g, '').split('#')[0];
      const clean2 = n2.toLowerCase().replace(/\s+/g, '').split('#')[0];
      return clean1 === clean2;
    };

    const getTeamForSide = (teamPlayers: { playerName: string }[]) => {
      for (const pResult of teamPlayers) {
        const found = players.find(p => isNameMatch(p.name, pResult.playerName))
          || substitutes.find(p => isNameMatch(p.name, pResult.playerName));
        if (found && found.teamId) {
          if (team1 && found.teamId === team1.id) return team1;
          if (team2 && found.teamId === team2.id) return team2;
        }
      }
      return undefined;
    };

    const blueResolved = getTeamForSide(result.blueTeam.players);
    if (blueResolved) {
      return {
        blueTeamName: blueResolved.name,
        redTeamName: (team1 && blueResolved.id === team1.id ? team2?.name : team1?.name) || 'Red Team'
      };
    }

    const redResolved = getTeamForSide(result.redTeam.players);
    if (redResolved) {
      return {
        blueTeamName: (team1 && redResolved.id === team1.id ? team2?.name : team1?.name) || 'Blue Team',
        redTeamName: redResolved.name
      };
    }

    return {
      blueTeamName: team1?.name || 'Blue Team',
      redTeamName: team2?.name || 'Red Team'
    };
  };

  return (
      <>
          <h1>{team1?.name + " vs " + team2?.name}</h1>
          {
            matchesList.map(([key, result]: [string, MatchResultData|undefined], game: number) => {
              const { blueTeamName, redTeamName } = getSideNames(result);
              return <>
                <h2>{!!result && `Game ${game + 1}`}</h2>
                {!!result && (
                  <MatchResult
                    key={key}
                    result={result}
                    blueTeamName={blueTeamName}
                    redTeamName={redTeamName}
                  />
                )}
              </>;
            })
          }
      </>
  );
};

export default MatchResultPage;
