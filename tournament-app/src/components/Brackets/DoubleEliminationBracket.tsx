import React from 'react';
import { Bracket, Seed, SeedItem, IRenderSeedProps } from 'react-brackets';
import { BracketContainer } from '../../styles';
import { useTournament } from '../../context/TournamentContext';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const TeamNameLink = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  display: block;
  padding: 0.5rem;

  &:hover {
    color: ${({ theme }) => theme.primary};
    text-decoration: underline;
  }
`;

const DoubleEliminationBracket: React.FC = () => {
  const { bracket } = useTournament();
  const navigate = useNavigate();

  if (!bracket || bracket.length === 0) {
    return <p>Bracket not yet finalized.</p>;
  }

  const handleTeamClick = (e: React.MouseEvent, teamId: number) => {
    e.stopPropagation();
    navigate(`/teams/${teamId}?division=gold`);
  };

  return (
    <BracketContainer>
      <Bracket
        rounds={bracket}
        renderSeedComponent={(props: IRenderSeedProps) => {
          const [team1, team2] = props.seed.teams;

          return (
              <Seed mobileBreakpoint={0}>
                <SeedItem>
                  <div>
                    {(team1 && team1.id) ? (
                      <TeamNameLink onClick={(e) => handleTeamClick(e, team1.id)}>
                        {team1.name || '- '}
                      </TeamNameLink>
                    ) : (
                      <div style={{ padding: '0.5rem', fontStyle: 'italic' }}>{(team1 && team1.name) || '- '}</div>
                    )}
                    {(team2 && team2.id) ? (
                      <TeamNameLink onClick={(e) => handleTeamClick(e, team2.id)}>
                        {team2?.name || '- '}
                      </TeamNameLink>
                    ) : (
                      <div style={{ padding: '0.5rem', fontStyle: 'italic' }}>{(team2 && team2?.name) || '- '}</div>
                    )}
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
