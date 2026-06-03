import React, { useState, useEffect, useRef } from 'react';

interface VisualMetronomeProps {
  bpm: number;
  beats: number;
  isPlaying: boolean;
  onBeat?: (beat: number) => void;
}

export const VisualMetronome: React.FC<VisualMetronomeProps> = ({
  bpm,
  beats = 4,
  isPlaying,
  onBeat,
}) => {
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  
  const intervalRef = useRef<any>(null);
  const onBeatRef = useRef(onBeat);

  // Sync the latest onBeat callback
  useEffect(() => {
    onBeatRef.current = onBeat;
  }, [onBeat]);

  const beatIntervalMs = 60000 / bpm;

  useEffect(() => {
    // Clean up any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isPlaying) {
      setCurrentBeat(1);
      setIsFlashActive(false);
      return;
    }

    const startTime = performance.now();
    let nextBeatIndex = 0;

    const checkBeat = () => {
      const elapsed = performance.now() - startTime;
      const targetTime = nextBeatIndex * beatIntervalMs;

      if (elapsed >= targetTime) {
        const beatNumber = (nextBeatIndex % beats) + 1;
        setCurrentBeat(beatNumber);
        setIsFlashActive(true);

        if (onBeatRef.current) {
          onBeatRef.current(beatNumber);
        }

        // Output debug logs as requested
        console.log(
          `[Metronome Debug] bpm: ${bpm}, interval: ${beatIntervalMs.toFixed(1)}ms, beat: ${beatNumber}/${beats}, isRunning: ${isPlaying}`
        );

        nextBeatIndex++;
      }
    };

    // Trigger the first beat immediately
    checkBeat();

    // High frequency interval (10ms) to check elapsed time and trigger beats precisely
    const intervalId = setInterval(checkBeat, 10);
    intervalRef.current = intervalId;

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, bpm, beats, beatIntervalMs]);

  // Handle flash decay
  useEffect(() => {
    if (isFlashActive) {
      const timer = setTimeout(() => {
        setIsFlashActive(false);
      }, 150); // Flash duration
      return () => clearTimeout(timer);
    }
  }, [isFlashActive, currentBeat]);


  return (
    <div style={{
      background: '#1e272e',
      borderRadius: '12px',
      padding: '10px 15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      width: '100%',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      marginTop: '10px',
      boxSizing: 'border-box',
    }}>
      {/* Blinking Indicator Light */}
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: isPlaying && isFlashActive
          ? '#ff3838'
          : '#400a0a',
        boxShadow: isPlaying && isFlashActive
          ? '0 0 15px #ff3838, 0 0 8px rgba(255, 56, 56, 0.8)'
          : '0 0 4px rgba(0, 0, 0, 0.5) inset',
        border: isPlaying && isFlashActive
          ? '1.5px solid #ff6b81'
          : '1.5px solid #2c0000',
        transform: isPlaying && isFlashActive ? 'scale(1.2)' : 'scale(1)',
        transition: isPlaying && isFlashActive ? 'transform 0.05s ease-out' : 'all 0.15s ease-out',
      }} />

      {/* BPM Info Text */}
      <span style={{
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#ff7675',
        fontFamily: 'Inter, sans-serif',
      }}>
        BPM {bpm}
      </span>
    </div>
  );

};
