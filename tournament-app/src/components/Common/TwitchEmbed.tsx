import React from 'react';
import styled from 'styled-components';

// --- Styled Components ---

// This container uses the modern `aspect-ratio` CSS property to maintain
// a perfect 16:9 ratio, making the embed fully responsive.
const EmbedContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000; /* Black background for loading */
  border-radius: 8px;
  overflow: hidden; /* Ensures the iframe respects the border-radius */
`;

const StyledIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

// --- Component Definition ---

interface TwitchEmbedProps {
  channel: string;
}

const TwitchEmbed: React.FC<TwitchEmbedProps> = ({ channel }) => {
  const parentDomain = process.env.NODE_ENV === 'production' 
    ? 'www.grumble.cc'
    : 'localhost';

  const embedUrl = `https://player.twitch.tv/?video=2602218681&parent=${parentDomain}&autoplay=true&muted=true`;

  return (
    <EmbedContainer>
      <StyledIframe
        src={embedUrl}
        allowFullScreen
        loading="lazy" // Improves performance by lazy-loading the iframe
        title={`Twitch stream for ${channel}`}
      />
    </EmbedContainer>
  );
};

export default TwitchEmbed;