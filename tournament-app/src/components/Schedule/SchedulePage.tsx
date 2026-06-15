import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { SchedulePageContainer, ScheduleTitle, TimelineContainer, StageCard, StageIcon, StageContent, StageTitle, StageDescription, StageLink, StageDate } from '../../styles';
import { useDivision } from '../../context/DivisionContext';
import { getYearFromHash } from '../../utils';

const tournamentStagesMaster = [
  {
    number: 1,
    title: "Sign-ups",
    description: "Team captains register their teams and access codes are distributed.",
    link: null,
    date: new Date("08/11/2025"),
    endDate: new Date("08/22/2025")
  },
  {
    number: 2,
    title: "Draft",
    description: "Captains build their rosters through a live, snake-style draft.",
    link: "/draft-access",
    date: new Date("08/26/2025"),
    endDate: new Date("08/31/2025")
  },
  {
    number: 3,
    title: "Swiss Stage",
    description: "Teams play in a swiss stage to determine top seeds.",
    link: "/swiss",
    date: new Date("09/01/2025"),
    endDate: new Date("09/21/2025")
  },
  {
    number: 4,
    title: "Knockout Stage",
    description: "The top teams from each group advance to a double-elimination bracket.",
    link: "/knockout",
    date: new Date("9/22/2025"),
    endDate: new Date("10/19/2025")
  },
  {
    number: 5,
    title: "Finals",
    description: "The Grand Finals determine the tournament champion.",
    link: null,
    date: new Date("10/20/2025"),
    endDate: new Date("10/21/2025")
  }
];
const tournamentStagesGold = [
  {
    number: 1,
    title: "Sign-ups",
    description: "Team captains register their teams and access codes are distributed.",
    link: null,
    date: new Date("08/11/2025"),
    endDate: new Date("08/22/2025")
  },
  {
    number: 2,
    title: "Draft",
    description: "Captains build their rosters through a live, snake-style draft.",
    link: "/draft-access",
    date: new Date("09/02/2025"),
    endDate: new Date("09/06/2025")
  },
  {
    number: 3,
    title: "Round Robin",
    description: "Teams play in a round robin group stage to determine top seeds.",
    link: "/swiss",
    date: new Date("09/08/2025"),
    endDate: new Date("09/28/2025")
  },
  {
    number: 4,
    title: "Knockout Stage",
    description: "The top teams from each group advance to a double-elimination bracket.",
    link: "/knockout",
    date: new Date("9/29/2025"),
    endDate: new Date("10/26/2025")
  },
  {
    number: 5,
    title: "Finals",
    description: "The Grand Finals determine the tournament champion.",
    link: null,
    date: new Date("10/27/2025"),
    endDate: new Date("10/28/2025")
  }
];

const tournamentStages2026 = [
  {
    number: 1,
    title: "Sign-ups",
    description: "Team captains register their teams and access codes are distributed.",
    link: null,
    date: new Date("06/15/2026"),
    endDate: new Date("07/05/2026")
  },
  {
    number: 2,
    title: "Draft",
    description: "Captains build their rosters through a live, snake-style draft.",
    link: "/draft-access",
    date: new Date("07/06/2026"),
    endDate: new Date("07/07/2026")
  },
  {
    number: 1,
    title: "Practice",
    description: "Teams get to know each other and practice some comps.",
    link: null,
    date: new Date("07/07/2026"),
    endDate: new Date("07/12/2026")
  },
  {
    number: 3,
    title: "Swiss Stage",
    description: "Teams play in a swiss stage to determine top seeds.",
    link: "/swiss",
    date: new Date("07/13/2026"),
    endDate: new Date("08/16/2026")
  },
  {
    number: 4,
    title: "Knockout Stage",
    description: "The top teams from each group advance to a double-elimination bracket.",
    link: "/knockout",
    date: new Date("08/17/2026"),
    endDate: new Date("09/13/2026")
  },
  {
    number: 5,
    title: "Finals",
    description: "The Grand Finals determine the tournament champion.",
    link: null,
    date: new Date("09/14/2026"),
    endDate: new Date("09/15/2026")
  }
];

const SchedulePage: React.FC = () => {
  const { division } = useDivision();
  const year = getYearFromHash(window.location.hash) || '2026';
  const is2026 = year === '2026';

  const getIconContent = (startDate: Date, endDate: Date, number: number) => {
    if (getStatusFromDate(startDate, endDate) === 'completed') return '✓';
    return number;
  }

  const getStatusFromDate = (startDate: Date, endDate: Date) => {
    const now = Date.now()
    if (now >= endDate.getTime()) return "completed";
    if (now >= startDate.getTime() && now <= endDate.getTime()) {
        return "in-progress";
    }
    return "upcoming";
  }

  const tournamentStages = is2026 ? tournamentStages2026 : (division === 'master' ? tournamentStagesMaster : tournamentStagesGold);

  return (
    <SchedulePageContainer>
      <ScheduleTitle>Tournament Schedule</ScheduleTitle>
      <TimelineContainer>
        {tournamentStages.map(stage => (
          <StageCard key={stage.number}>
            <StageIcon status={getStatusFromDate(stage.date, stage.endDate)}>
              {getIconContent(stage.date, stage.endDate, stage.number)}
            </StageIcon>
            <StageContent>
              <StageTitle>{stage.title}</StageTitle>
              <StageDate>
                <FaCalendarAlt />
                <span>{stage.date?.toDateString()}</span>
              </StageDate>
              <StageDescription>{stage.description}</StageDescription>
              {stage.link && (
                <StageLink to={stage.link}>
                  Go to Page
                </StageLink>
              )}
            </StageContent>
          </StageCard>
        ))}
      </TimelineContainer>
    </SchedulePageContainer>
  );
};

export default SchedulePage;
