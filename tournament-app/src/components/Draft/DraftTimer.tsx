import React, { useState, useEffect } from 'react';
import styled from 'styled-components';


const TimerWrapper = styled.div`
  background-color: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 220px;
`;

const TimerLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

// The color of the timer text will be passed as a prop
const TimerText = styled.div<{ color: string }>`
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  font-size: 2.75rem;
  font-weight: 700;
  color: ${(props) => props.color};
  line-height: 1.1;
  transition: color 0.5s ease-in-out;
`;

// --- Component Definition ---

interface DraftTimerProps {
  deadlineMs: number | null | undefined; 
}

const DraftTimer: React.FC<DraftTimerProps> = ({ deadlineMs }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  // This useEffect hook is responsible for the client-side countdown
  useEffect(() => {
    // If there's no deadline, don't start a timer
    if (!deadlineMs) {
      setSecondsLeft(0);
      return;
    }

    // Set up an interval to update the timer every second
    const interval = setInterval(() => {
      const diff = Math.round((deadlineMs - Date.now()) / 1000);
      setSecondsLeft(diff > 0 ? diff : 0);
    }, 1000);

    // Cleanup: clear the interval when the component unmounts or the deadlineMs changes
    return () => clearInterval(interval);
  }, [deadlineMs]);

  // --- Dynamic Color Logic ---
  let timerColor = '#343a40'; // Default dark color
  if (secondsLeft <= 10) {
    timerColor = '#dc3545'; // Danger red
  } else if (secondsLeft <= 30) {
    timerColor = '#fd7e14'; // Warning orange
  }

  // Format the time into MM:SS format
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  // Use padStart to ensure two digits for each part (e.g., 01 instead of 1)
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return (
    <TimerWrapper>
      <TimerLabel>Time Remaining</TimerLabel>
      <TimerText color={timerColor}>
        {formattedHours}:{formattedMinutes}:{formattedSeconds}
      </TimerText>
    </TimerWrapper>
  );
};

export default DraftTimer;