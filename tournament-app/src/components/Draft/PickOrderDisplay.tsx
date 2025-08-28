import React, { useRef, useEffect } from 'react';
import { DraftTeam, Player } from '../../types';
import { PickOrderContainer, PickList, PickItem, PickNumber, PickedTeamName, PickedPlayerName, SkippedText } from '../../styles';

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
      <PickList>
        {pickOrder.map((teamId, index) => {
          const isCurrent = index === currentPickIndex;
          const isCompleted = index < currentPickIndex;
          const isSkipped = typeof(teamId) === "string";
          
          const team = isSkipped ? null : getTeamById(teamId as number);
          const draftedPlayerId = completedPicks[index];
          const draftedPlayer = draftedPlayerId ? getPlayerById(draftedPlayerId) : null;

          return (
            <PickItem
              key={index}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isSkipped={isSkipped}
              ref={isCurrent ? currentPickRef : null}
            >
              <PickNumber>PICK {index + 1}</PickNumber>
              {isSkipped ? (
                <>
                  <SkippedText>SKIPPED</SkippedText>
                  <PickedPlayerName>{teamId}</PickedPlayerName>
                </>
              ) : (
                <>
                  <PickedTeamName>{team?.name || 'N/A'}</PickedTeamName>
                  {draftedPlayer && (
                    <PickedPlayerName>{draftedPlayer.name}</PickedPlayerName>
                  )}
                </>
              )}
            </PickItem>
          );
        })}
      </PickList>
    </PickOrderContainer>
  );
};

export default PickOrderDisplay;
