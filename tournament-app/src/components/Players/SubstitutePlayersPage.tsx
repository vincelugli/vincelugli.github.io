import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SubPlayer } from '../../types';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'; 
import { ControlsContainer, FilterGroup, SubsTableHead, ContactInfo, LoadingText, ErrorText, SubsPageContainer, SubsTitle, SubsPlayerTable, SubsLabel, SubsSelect, SubsTableBody, SubsCopyButton } from '../../styles/index';
import { convertRankToElo } from '../../utils';
import { useDivision } from '../../context/DivisionContext';

type SortDirection = 'ascending' | 'descending';
type SortKey = keyof SubPlayer;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ALL_ROLES = ['All', 'top', 'mid', 'jungle', 'adc', 'support'];

const SubstitutesPage: React.FC = () => {
  const [substitutes, setSubstitutes] = useState<SubPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const { division } = useDivision();

  useEffect(() => {
    const fetchSubs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const docRef = doc(db, 'players', `grumble2025_${division}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Safely access the 'subs' field, providing an empty array as a fallback
          const subsData = data.subs || [];
          setSubstitutes(subsData as SubPlayer[]);
        } else {
          setSubstitutes([])
        }
      } catch (err) {
        console.error("Error fetching substitutes:", err);
        setError("Failed to fetch data. Please check the console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubs();
  }, [division]);

  const handleCopy = (contact: string) => {
    navigator.clipboard.writeText(contact);
    setCopiedContact(contact);
    setTimeout(() => setCopiedContact(null), 2000); // Reset after 2 seconds
  };

  const filteredSubs = useMemo(() => {
    if (roleFilter === 'All') {
      return substitutes;
    }
    return substitutes.filter(sub => 
      sub.role.toLowerCase() === roleFilter.toLowerCase() ||
      sub.secondaryRoles.some(secRole => secRole.toLowerCase() === roleFilter.toLowerCase())
    );
  }, [substitutes, roleFilter]);

  const sortedAndFilteredSubs = useMemo(() => {
    const sortableItems = [...filteredSubs]; // Create a mutable copy
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'rankTier' && typeof(aValue) === 'string' && typeof(bValue) === 'string') {
        if (convertRankToElo(aValue, a['rankDivision']) < convertRankToElo(bValue, b['rankDivision'])) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (convertRankToElo(aValue, a['rankDivision']) > convertRankToElo(bValue, b['rankDivision'])) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      }

      // Simple string comparison, can be expanded for numbers if needed
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [filteredSubs, sortConfig]);

  const requestSort = useCallback((key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  if (isLoading) return <LoadingText>Loading Substitute Pool...</LoadingText>;
  if (error) return <ErrorText>{error}</ErrorText>;

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <FaSort color="#ccc" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp color="#007bff" /> : <FaSortDown color="#007bff" />;
  };

  return (
    <SubsPageContainer>
      <SubsTitle>Substitute Player Pool</SubsTitle>

      <ControlsContainer>
        <FilterGroup>
          <SubsLabel htmlFor="role-filter">Filter by Role</SubsLabel>
          <SubsSelect id="role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            {ALL_ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
          </SubsSelect>
        </FilterGroup>
      </ControlsContainer>

      <SubsPlayerTable>
        <SubsTableHead>
          <tr>
            <th onClick={() => requestSort('name')}>Name {getSortIcon('name')}</th>
            <th onClick={() => requestSort('rankTier')}>Rank {getSortIcon('rankTier')}</th>
            <th onClick={() => requestSort('role')}>Primary Role {getSortIcon('role')}</th>
            <th>Secondary Roles</th>
            <th onClick={() => requestSort('contact')}>Contact Info {getSortIcon('contact')}</th>
          </tr>
        </SubsTableHead>
        <SubsTableBody>
          {sortedAndFilteredSubs.map((sub, index) => (
            <tr key={index}>
              <td>{sub.name}</td>
              <td>{sub.rankTier} {sub.rankDivision}</td>
              <td>{sub.role}</td>
              <td>{sub.secondaryRoles?.join(', ')}</td>
              <td>
                <ContactInfo>
                  <span>{sub.contact}</span>
                  <SubsCopyButton onClick={() => handleCopy(sub.contact)}>
                    {copiedContact === sub.contact ? 'Copied!' : 'Copy'}
                  </SubsCopyButton>
                </ContactInfo>
              </td>
            </tr>
          ))}
        </SubsTableBody>
      </SubsPlayerTable>
    </SubsPageContainer>
  );
};

export default SubstitutesPage;
