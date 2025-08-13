import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const RouteChangeTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // This effect will run every time the location (URL path) changes.
    // We send a "pageview" event to Google Analytics.
    ReactGA.send({ 
      hitType: "pageview", 
      page: location.pathname + location.search,
      title: document.title 
    });
    
    console.log(`GA Pageview sent for: ${location.pathname + location.search}`);
  }, [location]);

  return null; // This component does not render anything to the DOM
};

export default RouteChangeTracker;