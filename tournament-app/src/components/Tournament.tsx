import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

      {year === '2026' && (
        <div style={{
          background: 'rgba(255, 71, 87, 0.08)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: '#ff4757',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Special Showmatch
            </span>
            <div>
              <strong style={{ fontSize: '1rem' }}>GRumble Catharsis</strong>
              <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>•</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>Friday, Sept 11 @ 6:00 PM PST</span>
              <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>•</span>
              <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>Working From Homeguard V2 vs Platinum Digger V2 (Bo5 Fearless)</span>
            </div>
          </div>
          <Link
            to="/catharsis"
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#ff4757',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            Event Details & Rosters →
          </Link>
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
