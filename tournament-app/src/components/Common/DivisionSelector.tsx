import React from 'react';
import { useDivision, Division } from '../../context/DivisionContext';
import { Label, Select, SelectWrapper } from '../../styles';

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
