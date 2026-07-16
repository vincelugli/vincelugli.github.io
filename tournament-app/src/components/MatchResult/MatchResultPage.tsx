import React, { useEffect, useState } from 'react';
import MatchResult from './MatchResult';
import { Match, MatchResultData, Team } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams } from 'react-router-dom';
import { useGameMatches } from '../../context/MatchesContext';
import { useTournament } from '../../context/TournamentContext';

interface MatchResultProps {
    match?: Match;
    teams?: Team[];
}

const MatchResultPage: React.FC<MatchResultProps> = ({ match: propMatch, teams: propTeams }) => {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches } = useGameMatches();
  const { teams: contextTeams } = useTournament();

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

  const team1 = !!match && !!teams ? teams.find(t => t.id === match.team1Id) : {name: ""};
  const team2 = !!match && !!teams ? teams.find(t => t.id === match.team2Id) : {name: ""};

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

  return (
      <>
          <h1>{team1?.name + " vs " + team2?.name}</h1>
          {
            matchesList.map(([key, result]: [string, MatchResultData|undefined], game: number) => {
              return <>
                <h2>{!!result && `Game ${game + 1}`}</h2>
                {!!result && <MatchResult key={key} result={result} />}
              </>;
            })
          }
      </>
  );
};

export default MatchResultPage;
