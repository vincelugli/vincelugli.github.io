import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDivision, Division } from '../../context/DivisionContext';

const DivisionSync: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { division, setDivision } = useDivision();

  useEffect(() => {
    const urlParam = searchParams.get('division')?.toLowerCase();
    if (urlParam) {
      let mappedDivision: Division | null = null;
      if (urlParam === 'master' || urlParam === 'elder') {
        mappedDivision = 'master';
      } else if (urlParam === 'gold' || urlParam === 'elemental') {
        mappedDivision = 'gold';
      } else if (urlParam === 'test') {
        mappedDivision = 'test';
      }

      if (mappedDivision && mappedDivision !== division) {
        setDivision(mappedDivision);
      }
    }
  }, [searchParams, division, setDivision]);

  return null;
};

export default DivisionSync;
