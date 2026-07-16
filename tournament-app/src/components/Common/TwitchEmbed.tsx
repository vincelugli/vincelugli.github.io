import React from 'react';
import { TwitchEmbedContainer, TwitchStyledIframe } from '../../styles';

// --- Component Definition ---

interface TwitchEmbedProps {
  channel: string;
}

const TwitchEmbed: React.FC<TwitchEmbedProps> = ({ channel }) => {
  const parentDomain = process.env.NODE_ENV === 'production' 
    ? 'www.grumble.cc'
    : 'localhost';

  const embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}&autoplay=true&muted=true`;
  return (
    <TwitchEmbedContainer>
      <TwitchStyledIframe
        src={embedUrl}
        allowFullScreen
        loading="lazy" // Improves performance by lazy-loading the iframe
        title={`Twitch stream for ${channel}`}
      />
    </TwitchEmbedContainer>
  );
};

export default TwitchEmbed;
