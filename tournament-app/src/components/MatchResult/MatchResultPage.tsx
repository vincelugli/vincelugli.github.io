import React, { useEffect, useState } from 'react';
import MatchResult from './MatchResult';
import { Match, MatchResultData, Team } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface MatchResultProps {
    match?: Match;
    teams?: Team[];
}

const MatchResultPage: React.FC<MatchResultProps> = ({ match, teams }) => {
  const [matchResults, setMatchResults] = useState(new Map<string, MatchResultData|undefined>());

  useEffect(() => {
    match?.tournamentCodes.forEach(async (tc) => {
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

  if (matchResults.size === 0) {
    return <>Loading match result...</>;
  }

  const matches = []
  for (const entry of matchResults) {
    matches.push(entry);
  }

  return (
      <>
          <h1>{team1?.name + " vs " + team2?.name}</h1>
          {
            matches.map(([key, result]: [string, MatchResultData|undefined], game: number) => {
              return <>
                <h2>{!!result && `Game ${game + 1}`}</h2>
                {!!result && <MatchResult key={key} result={result} />}
              </>
            })
          }
      </>
  );
};

export default MatchResultPage;
