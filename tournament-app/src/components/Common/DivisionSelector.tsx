import React from 'react';
import styled from 'styled-components';
import { useDivision, Division } from '../../context/DivisionContext';

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
  color: #555;
`;

const Select = styled.select`
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: white;
  cursor: pointer;
`;

const DivisionSelector: React.FC = () => {
  const { division, setDivision } = useDivision();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDivision(e.target.value as Division);
  };

  return (
    <SelectWrapper>
      <Label htmlFor="division-select">Division:</Label>
      <Select id="division-select" value={division} onChange={handleChange}>
        <option value="master">Master</option>
        <option value="gold">Gold</option>
      </Select>
    </SelectWrapper>
  );
};

export default DivisionSelector;
