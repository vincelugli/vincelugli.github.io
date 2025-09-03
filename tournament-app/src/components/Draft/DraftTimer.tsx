import React, { useState, useEffect } from 'react';
import { TimerWrapper, TimerLabel, TimerText } from '../../styles';

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

  // Pause outside of 8 - 5.
  const now = new Date();
  const isDraftPaused = now.getUTCHours() < 15 && now.getUTCHours() >= 0;

  return (
    <TimerWrapper>
      {!isDraftPaused && <TimerLabel>Time Remaining</TimerLabel>}
      <TimerText color={timerColor}>
        {isDraftPaused ? "DRAFT PAUSED" : formattedHours + ":" + formattedMinutes + ":" + formattedSeconds}
      </TimerText>
    </TimerWrapper>
  );
};

export default DraftTimer;
