import React, { useEffect, useState } from 'react';
import SwissStage from './Swiss/SwissStage';
import DoubleEliminationBracket from './Brackets/DoubleEliminationBracket';
import { TournamentContainer, SectionTitle } from '../styles';
import TwitchEmbed from './Common/TwitchEmbed';

const STREAM_START_ISO_WITH_OFFSET = '2025-10-26T15:00:00-07:00';

const Tournament: React.FC = () => {
  const [isStreamLive, setIsStreamLive] = useState(false);

  useEffect(() => {
    const checkStreamTime = () => {
      // 1. Get the current time's timestamp
      const now = Date.now();
      
      // 2. Create a Date object from our specific timezone string
      // This will be correctly interpreted by all modern browsers.
      const startTime = new Date(STREAM_START_ISO_WITH_OFFSET);

      // 3. Calculate the start and end times in milliseconds
      const startTimeMillis = startTime.getTime();

      // 4. Compare the timestamps
      const isLive = now >= startTimeMillis;
      
      setIsStreamLive(isLive);
      console.log(`Time check: Stream is currently ${isLive ? 'LIVE' : 'OFFLINE'}.`);
    };

    // Check the time immediately when the component loads
    checkStreamTime();

    // Then, set up an interval to check again every minute
    const intervalId = setInterval(checkStreamTime, 60 * 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // The empty dependency array ensures this effect runs only once

  return (
    <TournamentContainer>
      <div>
        <SectionTitle>Master Finals - October 26th 3pm PT / 6pm ET</SectionTitle>
        {isStreamLive ? (
          <TwitchEmbed channel="grumbleofficial" />
        ) : <></>}

      </div>
      <div>
        <SectionTitle>Swiss Stage</SectionTitle>
        <SwissStage />
      </div>
      <div>
        <SectionTitle>Knockout</SectionTitle>
        <DoubleEliminationBracket />
      </div>
    </TournamentContainer>
  );
};

export default Tournament;
