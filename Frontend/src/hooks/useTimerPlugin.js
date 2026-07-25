import { registerPlugin } from '@capacitor/core';
import { useEffect, useState, useCallback } from 'react';

// Register the custom plugin
const TimerPlugin = registerPlugin('Timer');

export const useTimerPlugin = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Listen for tick updates from the background service
    const tickListener = TimerPlugin.addListener('onTick', (info) => {
      setTime(info.time);
    });

    // Listen for notification action button clicks
    const actionListener = TimerPlugin.addListener('onAction', (info) => {
      switch (info.action) {
        case 'pause':
          setIsPaused(true);
          break;
        case 'resume':
          setIsPaused(false);
          break;
        case 'stop':
          setIsRunning(false);
          setIsPaused(false);
          setTime(0);
          break;
        default:
          break;
      }
    });

    // Cleanup listeners on unmount
    return () => {
      tickListener.then((listener) => listener.remove());
      actionListener.then((listener) => listener.remove());
    };
  }, []);

  const startTracker = useCallback(async (startTime = 0) => {
    await TimerPlugin.start({ startTime });
    setIsRunning(true);
    setIsPaused(false);
    setTime(startTime);
  }, []);

  const pauseTracker = useCallback(async () => {
    await TimerPlugin.pause();
    setIsPaused(true);
  }, []);

  const resumeTracker = useCallback(async () => {
    await TimerPlugin.resume();
    setIsPaused(false);
  }, []);

  const stopTracker = useCallback(async () => {
    await TimerPlugin.stop();
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
  }, []);

  // Format time as HH:MM:SS for display
  const formattedTime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    time,
    formattedTime: formattedTime(),
    isRunning,
    isPaused,
    startTracker,
    pauseTracker,
    resumeTracker,
    stopTracker,
  };
};
