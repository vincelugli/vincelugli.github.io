import React from 'react';
import { Bracket, Seed, SeedItem, SeedTeam, IRenderSeedProps } from 'react-brackets';
import { BracketRound } from '../../types';
import { BracketContainer } from '../../styles';

interface BracketProps {
  bracket: BracketRound[];
}

// TODO: Pull record from database
// TODO: Hook into division context
const DoubleEliminationBracket: React.FC<BracketProps> = ({ bracket }) => {
  if (!bracket || bracket.length === 0) {
    return <p>Bracket not yet finalized.</p>;
  }

  return (
    <BracketContainer>
      <Bracket
        rounds={bracket}
        renderSeedComponent={(props: IRenderSeedProps) => {
          return (
            <Seed mobileBreakpoint={0}>
              <SeedItem>
                <div>
                  <SeedTeam>{props.seed.teams[0]?.name || '- '}</SeedTeam>
                  <SeedTeam>{props.seed.teams[1]?.name || '- '}</SeedTeam>
                </div>
              </SeedItem>
            </Seed>
          );
        }}
      />
    </BracketContainer>
  );
};

export default DoubleEliminationBracket;
