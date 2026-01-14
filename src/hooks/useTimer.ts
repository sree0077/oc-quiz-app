import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
  formatTime: (seconds: number) => string;
}

export const useTimer = ({
  initialTime,
  onTimeUp,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpCalledRef = useRef(false);

  // Start timer
  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    timeUpCalledRef.current = false;
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  // Resume timer
  const resume = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  // Reset timer
  const reset = useCallback(() => {
    setTimeRemaining(initialTime);
    setIsRunning(false);
    setIsPaused(false);
    timeUpCalledRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [initialTime]);

  // Add time to timer
  const addTime = useCallback((seconds: number) => {
    setTimeRemaining(prev => Math.max(0, prev + seconds));
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time is up
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            
            // Call onTimeUp only once
            if (!timeUpCalledRef.current && onTimeUp) {
              timeUpCalledRef.current = true;
              onTimeUp();
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, onTimeUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    addTime,
    formatTime,
  };
};

