import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTimer } from '../../hooks/useTimer';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  autoStart?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, autoStart = true }) => {
  const { timeRemaining, isRunning, isPaused, start, pause, resume, formatTime } = useTimer({
    initialTime: duration,
    onTimeUp,
    autoStart,
  });

  // Calculate warning state (less than 5 minutes)
  const isWarning = timeRemaining <= 300 && timeRemaining > 60;
  const isCritical = timeRemaining <= 60;

  const getTimerColor = () => {
    if (isCritical) return '#D32F2F'; // Red
    if (isWarning) return '#F57C00'; // Orange
    return '#1976D2'; // Blue
  };

  return (
    <View style={styles.container}>
      <View style={[styles.timerBox, { borderColor: getTimerColor() }]}>
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          {formatTime(timeRemaining)}
        </Text>
        <Text style={styles.label}>Time Remaining</Text>
      </View>
      
      {/* Optional pause/resume controls */}
      {/* <View style={styles.controls}>
        {isRunning ? (
          <IconButton icon="pause" size={20} onPress={pause} />
        ) : isPaused ? (
          <IconButton icon="play" size={20} onPress={resume} />
        ) : null}
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBox: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    marginTop: 8,
  },
});

