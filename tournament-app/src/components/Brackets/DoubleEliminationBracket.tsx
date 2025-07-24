import React from 'react';
import styled from 'styled-components';
import { Bracket, Seed, SeedItem, SeedTeam, IRenderSeedProps } from 'react-brackets';
import { BracketRound } from '../../types';

interface BracketProps {
  bracket: BracketRound[];
}

const BracketContainer = styled.div`
  /* The key property: enables horizontal scrolling only when needed */
  overflow-x: auto;

  /* Optional: Add some nice styling for the scrollable area */
  padding: 1.5rem;
  background-color: #fcfcfc; /* Slightly different background to stand out */
  border-radius: 8px;
  border: 1px solid #e0e0e0;

  /* Improve scrollbar appearance on Webkit browsers (Chrome, Safari) */
  &::-webkit-scrollbar {
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;


const DoubleEliminationBracket: React.FC<BracketProps> = ({ bracket }) => {
  if (!bracket || bracket.length === 0) {
    return <p>Bracket not yet finalized.</p>;
  }

  return (
    <BracketContainer>
      <Bracket
        rounds={bracket}
        renderSeedComponent={(props: IRenderSeedProps) => {
          // ISeedProps comes from the react-brackets library
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
