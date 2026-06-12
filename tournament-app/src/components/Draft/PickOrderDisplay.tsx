import React, { useRef, useEffect } from 'react';
import { DraftTeam, Player } from '../../types';
import { PickOrderContainer, PickList, PickItem, PickNumber, PickedTeamName, PickedPlayerName, SkippedText, RoundDivider, DividerLine, DividerLabel } from '../../styles';

interface PickOrderDisplayProps {
  pickOrder: (number | string)[];
  teams: DraftTeam[];
  players: Player[];
  currentPickIndex: number;
  completedPicks: { [pickIndex: number]: number };
}

const PickOrderDisplay: React.FC<PickOrderDisplayProps> = ({ pickOrder, teams, players, currentPickIndex, completedPicks }) => {
  const currentPickRef = useRef<HTMLDivElement>(null);

  // Effect to scroll the current pick into view
  useEffect(() => {
    if (currentPickRef.current) {
      currentPickRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentPickIndex]);

  const getTeamById = (id: number) => teams.find(t => t.id === id);
  const getPlayerById = (id: number) => players.find(p => p.id === id);

  return (
    <PickOrderContainer>
      <div style={{
        padding: '10px',
        color: '#aaa',
        fontSize: '0.8rem',
        textAlign: 'center',
        fontStyle: 'italic',
        position: 'sticky',
        left: 0,
        zIndex: 1
      }}>
        Note: Picks for future rounds are predicted based on current team Elo and will update dynamically at the end of each round.
      </div>
      <PickList>
        {pickOrder.map((teamId, index) => {
          const isCurrent = index === currentPickIndex;
          const isCompleted = index < currentPickIndex;
          const isSkipped = typeof (teamId) === "string";

          const team = isSkipped ? null : getTeamById(teamId as number);
          const draftedPlayerId = completedPicks[index];
          const draftedPlayer = draftedPlayerId ? getPlayerById(draftedPlayerId) : null;

          const numTeams = teams?.length || 0;
          const isPredicted = numTeams > 0 && Math.floor(index / numTeams) > Math.floor(currentPickIndex / numTeams);
          const showDelimiter = numTeams > 0 && index > 0 && index % numTeams === 0;
          const roundNumber = numTeams > 0 ? Math.floor(index / numTeams) + 1 : 1;

          return (
            <React.Fragment key={index}>
              {showDelimiter && (
                <RoundDivider>
                  <DividerLine />
                  <DividerLabel>Round {roundNumber}</DividerLabel>
                </RoundDivider>
              )}
              <PickItem
                isCurrent={isCurrent}
                isCompleted={isCompleted}
                isSkipped={isSkipped}
                isPredicted={isPredicted}
                ref={isCurrent ? currentPickRef : null}
              >
                <PickNumber>PICK {index + 1}</PickNumber>
                {isSkipped ? (
                  <>
                    <SkippedText>SKIPPED</SkippedText>
                    <PickedPlayerName>{teamId}{isPredicted ? ' (Predicted)' : ''}</PickedPlayerName>
                  </>
                ) : (
                  <>
                    <PickedTeamName>{team?.name || 'N/A'}{isPredicted ? ' (Predicted)' : ''}</PickedTeamName>
                    {draftedPlayer && (
                      <PickedPlayerName>{draftedPlayer.name}</PickedPlayerName>
                    )}
                  </>
                )}
              </PickItem>
            </React.Fragment>
          );
        })}
      </PickList>
    </PickOrderContainer>
  );
};

export default PickOrderDisplay;
