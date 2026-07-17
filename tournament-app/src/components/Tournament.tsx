import React, { useEffect, useState } from 'react';
import SwissStage from './Swiss/SwissStage';
import SwissBracket from './Swiss/SwissBracket';
import DoubleEliminationBracket from './Brackets/DoubleEliminationBracket';
import TwitchEmbed from './Common/TwitchEmbed';
import {FaTwitch} from 'react-icons/fa';
import {
  TournamentContainer,
  SectionTitle,
  TournamentSectionHeader,
  TournamentInlineSectionTitle,
  TournamentViewStageLink,
  LiveBadge,
} from '../styles';
import { getYearFromHash } from '../utils';

const Tournament: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const response = await fetch('https://decapi.me/twitch/uptime/grumbleofficial?offline_msg=offline');
        const text = await response.text();
        setIsLive(!!text && text.trim().toLowerCase() !== 'offline');
      } catch (error) {
        console.error('Error checking Twitch live status:', error);
        setIsLive(false);
      }
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const year = getYearFromHash(hash) || '2026';

  return (
    <TournamentContainer>
      {isLive && (
        <div>
          <TournamentSectionHeader style={{marginBottom: '1rem'}}>
            <TournamentInlineSectionTitle>
              <FaTwitch style={{color: '#9146ff', marginRight: '0.5rem', verticalAlign: 'middle'}} />
              Watch Live
              <LiveBadge>Live</LiveBadge>
            </TournamentInlineSectionTitle>
          </TournamentSectionHeader>
          <TwitchEmbed channel="grumbleofficial" />
        </div>
      )}
      <div>
        {year === '2026' ? (
          <>
            <TournamentSectionHeader>
              <TournamentInlineSectionTitle>Swiss Stage</TournamentInlineSectionTitle>
              <TournamentViewStageLink to="/swiss">Full Swiss Stage & Standings →</TournamentViewStageLink>
            </TournamentSectionHeader>
            <SwissBracket />
          </>
        ) : (
          <>
            <SectionTitle>Swiss Stage</SectionTitle>
            <SwissStage />
          </>
        )}
      </div>
      <div>
        <SectionTitle>Knockout</SectionTitle>
        <DoubleEliminationBracket />
      </div>
    </TournamentContainer>
  );
};

export default Tournament;
