import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Team } from '../../types';

// Main container for the page
const TeamsContainer = styled.div`
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

// Page title
const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 3px solid #f0f2f5;
  padding-bottom: 1rem;
`;

// Styled table for a clean layout
const TeamsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

// Table header
const TableHead = styled.thead`
  background-color: #f9f9f9;
  
  th {
    padding: 1rem;
    font-size: 1rem;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

// Table body
const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid #eee;
    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 1.25rem 1rem;
    vertical-align: middle;
  }
`;

// Style for the team name to make it a prominent link
const TeamNameLink = styled(Link)`
  font-weight: 600;
  color: #007bff;
  text-decoration: none;
  font-size: 1.1rem;

  &:hover {
    text-decoration: underline;
  }
`;

// Style for the team record
const TeamRecord = styled.span`
  font-weight: 500;
  font-size: 1.1rem;
  color: #333;
`;

// Define the component's props
interface TeamsPageProps {
  teams: Team[];
}

const TeamsPage: React.FC<TeamsPageProps> = ({ teams }) => {
  return (
    <TeamsContainer>
      <Title>All Teams</Title>
      <TeamsTable>
        <TableHead>
          <tr>
            <th>Team Name</th>
            <th>Record (W-L)</th>
          </tr>
        </TableHead>
        <TableBody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>
                {/* Each team name links to their detailed match history */}
                <TeamNameLink to={`/match-history/${team.id}`}>
                  {team.name}
                </TeamNameLink>
              </td>
              <td>
                <TeamRecord>{team.record}</TeamRecord>
              </td>
            </tr>
          ))}
        </TableBody>
      </TeamsTable>
    </TeamsContainer>
  );
};

export default TeamsPage;